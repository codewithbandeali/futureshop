<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Cross-sell recommendations — "Frequently bought together" / "People
 * also viewed". Pure SQL aggregate over the orders history: for a given
 * anchor product, find the most frequent companion product across all
 * orders that contained the anchor.
 *
 * Fallback when no co-purchase data exists yet (cold start) returns the
 * top-N other products in the same category — so the storefront still
 * has something to show.
 */
class CrossSellController extends Controller
{
    public function frequentlyBoughtTogether($id): JsonResponse
    {
        $anchor = Product::with(['images'])->find($id);
        if (!$anchor) {
            return response()->json(['data' => []]);
        }

        // Pull every other product_id that appeared in the same orders as
        // the anchor, ranked by co-occurrence count. Limit 4 because the
        // typical FBT widget shows 3-4 cards next to the anchor.
        $companionRows = OrderItem::select('product_id', DB::raw('COUNT(*) as cnt'))
            ->whereIn('order_id', function ($q) use ($id) {
                $q->select('order_id')
                    ->from('order_items')
                    ->where('product_id', $id);
            })
            ->where('product_id', '!=', $id)
            ->groupBy('product_id')
            ->orderByDesc('cnt')
            ->limit(4)
            ->get();

        $companionIds = $companionRows->pluck('product_id')->all();

        // Cold-start fallback: no order history yet → same-category picks.
        if (empty($companionIds)) {
            $companions = Product::with(['images', 'ratings'])
                ->where('category', $anchor->category)
                ->where('id', '!=', $id)
                ->limit(3)
                ->get();
        } else {
            $companions = Product::with(['images', 'ratings'])
                ->whereIn('id', $companionIds)
                ->get()
                ->sortBy(fn($p) => array_search($p->id, $companionIds))
                ->values();
        }

        return ProductResource::collection($companions)->response();
    }
}
