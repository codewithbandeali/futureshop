<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Public: validate a code against a tentative subtotal, returning the
     * discount and the (possibly trimmed) coupon for display. Called by
     * the checkout page when the customer types a code.
     */
    public function preview(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:64',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($data['code']))->first();
        if (! $coupon || ! $coupon->isCurrentlyRedeemable()) {
            return response()->json(['valid' => false, 'message' => 'Invalid or expired code'], 404);
        }

        if ($coupon->first_order_only && $request->user()) {
            $hasPriorOrder = Order::where('user_id', $request->user()->id)->exists();
            if ($hasPriorOrder) {
                return response()->json(['valid' => false, 'message' => 'This code is for new customers only'], 422);
            }
        }

        $discount = $coupon->discountFor((float) $data['subtotal']);
        if ($discount <= 0) {
            $msg = $coupon->min_subtotal
                ? "Spend at least \${$coupon->min_subtotal} to use this code"
                : 'This code does not apply to your cart';
            return response()->json(['valid' => false, 'message' => $msg], 422);
        }

        return response()->json([
            'valid' => true,
            'coupon' => [
                'code' => $coupon->code,
                'description' => $coupon->description,
                'discount_type' => $coupon->discount_type,
                'discount_value' => (float) $coupon->discount_value,
            ],
            'discount' => $discount,
        ]);
    }

    /**
     * Admin: full CRUD. List + store + destroy. Update is rare in practice;
     * if you need it later, deactivate and create a new code instead.
     */
    public function index(): JsonResponse
    {
        return response()->json(Coupon::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:64|unique:coupons,code',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_subtotal' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'first_order_only' => 'sometimes|boolean',
            'is_public' => 'sometimes|boolean',
            'active' => 'sometimes|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon = Coupon::create($data);
        return response()->json($coupon, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
}
