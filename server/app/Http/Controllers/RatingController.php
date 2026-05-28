<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Rating;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingController extends Controller
{
    public function __construct(private CloudinaryService $cloudinary)
    {
    }

    public function index(int $productId): JsonResponse
    {
        $ratings = Rating::with('user:id,name')
            ->where('product_id', $productId)
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'rating' => (int) $r->rating,
                'review' => $r->review,
                'verified' => (bool) $r->verified,
                'photos' => $r->photos ?? [],
                'author_name' => $r->user?->name ?? 'Anonymous',
                'created_at' => $r->created_at,
            ]);

        return response()->json($ratings);
    }

    /**
     * Customer submits a review. `verified` is computed server-side: true
     * when the user has at least one order containing this product (any
     * status except cancelled/refunded). The client cannot forge it.
     */
    public function store(Request $request, int $productId): JsonResponse
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:2000',
            'photos' => 'sometimes|array|max:5',
            'photos.*' => 'image|max:5120',
        ]);

        $userId = $request->user()->id;

        $verified = OrderItem::whereHas('order', function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->whereNotIn('status', ['cancelled', 'refunded']);
        })->where('product_id', $productId)->exists();

        // Upload any review photos before persisting the row so the URL
        // list is final by the time we save.
        $photoUrls = [];
        if ($request->hasFile('photos')) {
            foreach ((array) $request->file('photos') as $file) {
                try {
                    $upload = $this->cloudinary->upload($file);
                    $photoUrls[] = $upload['url'];
                } catch (\Throwable $e) {
                    report($e);
                }
            }
        }

        $payload = [
            'rating' => $data['rating'],
            'review' => $data['review'] ?? null,
            'verified' => $verified,
        ];
        if (!empty($photoUrls)) {
            $payload['photos'] = $photoUrls;
        }

        $rating = Rating::updateOrCreate(
            ['product_id' => $productId, 'user_id' => $userId],
            $payload
        );

        return response()->json([
            'id' => $rating->id,
            'rating' => (int) $rating->rating,
            'review' => $rating->review,
            'verified' => (bool) $rating->verified,
            'photos' => $rating->photos ?? [],
            'author_name' => $request->user()->name,
            'created_at' => $rating->created_at,
        ], 201);
    }
}
