<?php

namespace App\Http\Controllers;

use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function index(int $productId): JsonResponse
    {
        return response()->json(
            Rating::where('product_id', $productId)->latest()->get()
        );
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:2000',
        ]);

        $rating = Rating::updateOrCreate(
            ['product_id' => $productId, 'user_id' => $request->user()->id],
            $data
        );

        return response()->json($rating, 201);
    }
}
