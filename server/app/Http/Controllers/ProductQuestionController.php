<?php

namespace App\Http\Controllers;

use App\Models\ProductQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Customer Q&A on product pages.
 *  - index: public list of published questions for a product
 *  - store: authenticated user submits a question (unanswered, published)
 *  - answer: admin-only, fills the answer text
 *
 * Per-product threading and voting are deliberate non-goals — the
 * 95th-percentile e-commerce use-case is "one best answer". Promote
 * to a richer schema only when real volume justifies it.
 */
class ProductQuestionController extends Controller
{
    public function index(int $productId): JsonResponse
    {
        $questions = ProductQuestion::where('product_id', $productId)
            ->where('is_published', true)
            ->latest()
            ->get(['id', 'author_name', 'question', 'answer', 'answered_at', 'created_at']);

        return response()->json($questions);
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        $data = $request->validate([
            'question' => 'required|string|min:8|max:1000',
            'author_name' => 'nullable|string|max:120',
        ]);

        $q = ProductQuestion::create([
            'product_id' => $productId,
            'user_id' => $request->user()->id,
            'author_name' => $data['author_name'] ?? $request->user()->name ?? 'Customer',
            'question' => $data['question'],
            'is_published' => true,
        ]);

        return response()->json($q, 201);
    }

    public function answer(Request $request, int $questionId): JsonResponse
    {
        $data = $request->validate([
            'answer' => 'required|string|min:1|max:2000',
        ]);
        $q = ProductQuestion::findOrFail($questionId);
        $q->answer = $data['answer'];
        $q->answered_at = now();
        $q->save();
        return response()->json($q);
    }
}
