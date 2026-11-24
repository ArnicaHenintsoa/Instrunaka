<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = Review::with([
            'user:id,name,email',
            'instrumental:id,title',
        ])
        ->latest()
        ->paginate(30);

        return response()->json($reviews);
    }

    public function toggleVisibility(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->is_visible = !$review->is_visible;
        $review->save();

        AuditLogger::log(
            $review->is_visible ? 'review.shown' : 'review.hidden',
            $review
        );

        return response()->json([
            'message'    => $review->is_visible ? 'Avis affiché.' : 'Avis masqué.',
            'is_visible' => $review->is_visible,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        AuditLogger::log('review.deleted', $review);
        $review->delete();

        return response()->json(['message' => 'Avis supprimé.']);
    }
}