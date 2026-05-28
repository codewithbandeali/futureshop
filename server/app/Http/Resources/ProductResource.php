<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Adapts the Laravel Product model into the shape expected by the
 * Next.js storefront (originally borrowed from GoCart):
 *
 *   { id, name, slug, category, brand, description, price, mrp,
 *     inStock, images: [url, ...], rating: [{rating, review, ...}, ...] }
 *
 * Keeping this translation in one place means the database can evolve
 * (snake_case, additional columns, normalized image rows) without the
 * frontend ever knowing.
 */
class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        $imageUrls = $this->whenLoaded('images', function () {
            return $this->images->pluck('image')->values();
        }, fn() => []);

        // If only the joined thumbnail is present (from index()), fall back to it.
        if (empty($imageUrls) && isset($this->thumbnail) && is_string($this->thumbnail)) {
            $imageUrls = [$this->thumbnail];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'brand' => $this->brand,
            'description' => $this->description,
            'price' => (float) $this->price,
            'mrp' => $this->mrp !== null ? (float) $this->mrp : (float) $this->price,
            'sku' => $this->sku,
            'stock' => (int) ($this->stock ?? 0),
            'inStock' => ((int) ($this->stock ?? 0)) > 0,
            'shipping' => (bool) $this->shipping,
            // Soft variants — JSON map of attribute name → list of choices.
            // Storefront renders a chip-picker per key. See the
            // add_options_to_products_table migration for the contract.
            'options' => $this->options ?? null,
            'video_url' => $this->video_url,
            // Sequential frames for the 360° spinner. Null when none uploaded —
            // the storefront hides the spin toggle in that case.
            'view_360_urls' => $this->view_360_urls ?: null,
            // A+ content — ordered array of block objects rendered under
            // the Description tab. See migration for the shape contract.
            'aplus_blocks' => $this->aplus_blocks ?: null,
            'images' => $imageUrls,
            'rating' => $this->whenLoaded('ratings', function () {
                return $this->ratings->map(fn($r) => [
                    'id' => $r->id,
                    'rating' => (int) $r->rating,
                    'review' => $r->review,
                    'user_id' => $r->user_id,
                    'created_at' => $r->created_at,
                ])->values();
            }, fn() => []),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
