<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Image;
use App\Models\Product;
use App\Models\Thumbnail;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function __construct(private CloudinaryService $cloudinary)
    {
    }

    public function index(): JsonResponse
    {
        $products = Product::with(['images', 'ratings'])
            ->leftJoin('thumbnails', 'products.id', '=', 'thumbnails.product_id')
            ->select('products.*', 'thumbnails.thumbnail')
            ->get();

        return ProductResource::collection($products)->response();
    }

    public function getProduct($idOrSlug): JsonResponse
    {
        // SEO-friendly URLs use the slug; the admin still links by numeric ID.
        // Accept either so `/api/products/dell-xps-13-2024` and `/api/products/1`
        // both resolve to the same product.
        $query = Product::with(['images', 'ratings']);
        $product = is_numeric($idOrSlug)
            ? $query->find((int) $idOrSlug)
            : $query->where('slug', $idOrSlug)->first();

        if (!$product) {
            return response()->json(['message' => "No product found for: {$idOrSlug}"], 404);
        }
        return (new ProductResource($product))->response();
    }

    /**
     * Admin: create a product. Uploads to Cloudinary in a single transaction
     * so a failed image upload doesn't leave an orphan row behind.
     */
    public function store(Request $request): JsonResponse
    {
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'mrp' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'brand' => 'required|string',
            'shipping' => 'sometimes|boolean',
            'sku' => 'nullable|string|max:64',
            'thumbnail' => 'sometimes|image|max:5120', // 5 MB
            'images.*' => 'sometimes|image|max:5120',
        ]);

        $fields['slug'] = Str::slug($fields['name']) . '-' . Str::lower(Str::random(4));
        $fields['shipping'] = $fields['shipping'] ?? true;

        $product = DB::transaction(function () use ($request, $fields) {
            $product = Product::create($fields);

            // Thumbnail
            if ($request->hasFile('thumbnail')) {
                $upload = $this->cloudinary->upload($request->file('thumbnail'));
                Thumbnail::create([
                    'product_id' => $product->id,
                    'thumbnail' => $upload['url'],
                ]);
                Image::create([
                    'product_id' => $product->id,
                    'image' => $upload['url'],
                ]);
            }

            // Additional images
            if ($request->hasFile('images')) {
                foreach ((array) $request->file('images') as $file) {
                    $upload = $this->cloudinary->upload($file);
                    Image::create([
                        'product_id' => $product->id,
                        'image' => $upload['url'],
                    ]);
                }
            }

            return $product->fresh(['images', 'ratings']);
        });

        return (new ProductResource($product))->response()->setStatusCode(201);
    }

    /**
     * Admin: update a product. Image uploads are additive — existing images
     * stay unless explicitly cleared via /api/products/{id}/images/{imageId}.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $fields = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'mrp' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'category' => 'sometimes|string',
            'brand' => 'sometimes|string',
            'shipping' => 'sometimes|boolean',
            'sku' => 'nullable|string|max:64',
            'thumbnail' => 'sometimes|image|max:5120',
            'images.*' => 'sometimes|image|max:5120',
        ]);

        DB::transaction(function () use ($request, $fields, $product) {
            $product->update($fields);

            if ($request->hasFile('thumbnail')) {
                $upload = $this->cloudinary->upload($request->file('thumbnail'));
                Thumbnail::updateOrCreate(
                    ['product_id' => $product->id],
                    ['thumbnail' => $upload['url']]
                );
            }

            if ($request->hasFile('images')) {
                foreach ((array) $request->file('images') as $file) {
                    $upload = $this->cloudinary->upload($file);
                    Image::create([
                        'product_id' => $product->id,
                        'image' => $upload['url'],
                    ]);
                }
            }
        });

        $product->load(['images', 'ratings']);
        return (new ProductResource($product))->response();
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        // Cloudinary cleanup is best-effort; we don't store public_ids on Image
        // rows yet, so we just drop the local rows. Add a migration if you
        // want to track public_ids and delete the assets too.
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
