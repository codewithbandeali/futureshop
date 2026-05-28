<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items', 'address'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return OrderResource::collection($orders)->response();
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items', 'address'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return (new OrderResource($order))->response();
    }

    /**
     * Admin: list every order. The customer-scoped `index()` filters by
     * user; admins need to see the whole shop.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['items', 'address', 'user'])
            ->latest()
            ->paginate(50);

        return OrderResource::collection($orders)->response();
    }

    /**
     * Admin: change an order's lifecycle status. Wrapped in DB transaction
     * because cancelling needs to restock; one transaction means either both
     * sides land or neither does.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,paid,shipped,delivered,cancelled,refunded',
        ]);

        $order = Order::with('items')->findOrFail($id);
        $prev = $order->status;
        $next = $data['status'];

        if ($prev === $next) {
            return (new OrderResource($order))->response();
        }

        DB::transaction(function () use ($order, $prev, $next) {
            // Restock when moving to a "no longer fulfilled" state.
            $isCancellation = in_array($next, ['cancelled', 'refunded'], true);
            $wasFulfilled = !in_array($prev, ['cancelled', 'refunded'], true);

            if ($isCancellation && $wasFulfilled) {
                foreach ($order->items as $item) {
                    \App\Models\Product::where('id', $item->product_id)
                        ->increment('stock', $item->quantity);
                }
            }

            $order->status = $next;
            if ($next === 'paid') {
                $order->payment_status = 'paid';
            }
            $order->save();
        });

        $order->refresh()->load(['items', 'address']);
        return (new OrderResource($order))->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'address_id' => 'required|integer|exists:addresses,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
            'currency' => 'nullable|string|size:3',
            'coupon_code' => 'nullable|string|max:64',
        ]);

        return DB::transaction(function () use ($request, $data) {
            $subtotal = 0.0;
            $rows = [];

            // Lock product rows while we compute the order; prevents the
            // classic two-customers-bought-the-last-unit race.
            $productIds = collect($data['items'])->pluck('product_id')->all();
            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($data['items'] as $item) {
                $p = $products->get($item['product_id']);
                if (!$p) {
                    abort(422, "Product {$item['product_id']} not found");
                }
                if ($p->stock < $item['quantity']) {
                    abort(422, "Insufficient stock for product {$p->id}");
                }
                $lineTotal = (float) $p->price * (int) $item['quantity'];
                $subtotal += $lineTotal;
                $rows[] = [
                    'product_id' => $p->id,
                    'product_name' => $p->name,
                    'product_sku' => $p->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $p->price,
                    'line_total' => $lineTotal,
                ];
                $p->decrement('stock', $item['quantity']);
            }

            // Resolve coupon — must be locked too so two simultaneous
            // checkouts can't both consume the last redemption slot.
            $coupon = null;
            $discount = 0.0;
            if (!empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper($data['coupon_code']))
                    ->lockForUpdate()
                    ->first();
                if ($coupon && $coupon->isCurrentlyRedeemable()) {
                    $discount = $coupon->discountFor($subtotal);
                    if ($discount > 0) {
                        $coupon->increment('usage_count');
                    } else {
                        $coupon = null;
                    }
                } else {
                    $coupon = null; // silently drop bad codes — UI validated already
                }
            }

            $shipping = ($subtotal - $discount) >= 50 ? 0 : 5.99;
            $tax = round(($subtotal - $discount) * 0.0, 2); // placeholder
            $total = max(0, $subtotal - $discount + $shipping + $tax);

            $order = Order::create([
                'user_id' => $request->user()->id,
                'address_id' => $data['address_id'],
                'coupon_id' => $coupon?->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping' => $shipping,
                'tax' => $tax,
                'total' => $total,
                'currency' => $data['currency'] ?? 'USD',
                'payment_method' => $data['payment_method'] ?? null,
                'payment_status' => 'unpaid',
            ]);

            $order->items()->createMany($rows);
            $order->load(['items', 'address']);

            return (new OrderResource($order))->response()->setStatusCode(201);
        });
    }
}
