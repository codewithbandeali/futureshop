<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin endpoints for managing the people who buy things. Read-only for now;
 * GDPR-style account deletion can come later.
 */
class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orderAgg = Order::query()
            ->select('user_id', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(total) as lifetime_value'))
            ->groupBy('user_id');

        $users = User::query()
            ->leftJoinSub($orderAgg, 'o', fn($j) => $j->on('o.user_id', '=', 'users.id'))
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'users.created_at',
                DB::raw('COALESCE(o.order_count, 0) as order_count'),
                DB::raw('COALESCE(o.lifetime_value, 0) as lifetime_value')
            )
            ->where('users.role', '!=', 'admin')
            ->latest('users.created_at')
            ->paginate(50);

        return response()->json($users);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $orders = Order::with('items')->where('user_id', $id)->latest()->get();
        return response()->json([
            'user' => $user,
            'orders' => $orders,
        ]);
    }
}
