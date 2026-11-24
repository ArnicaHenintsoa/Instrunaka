<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumental;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(int $instrumentalId): JsonResponse
    {
        $reviews = Review::with('user:id,name')
            ->where('instrumental_id', $instrumentalId)
            ->where('is_visible', true)
            ->latest()
            ->get();

        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request, int $instrumentalId): JsonResponse
    {
        $validated = $request->validate([
            'rating'  => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Vérifier que l'utilisateur a bien acheté et payé cette instrumentale
        $hasPurchased = Order::where('user_id', $request->user()->id)
            ->where('instrumental_id', $instrumentalId)
            ->where('status', 'validated')
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'message' => 'Vous devez avoir acheté cette instrumentale pour laisser un avis.',
            ], 403);
        }

        Instrumental::findOrFail($instrumentalId);

        $review = Review::updateOrCreate(
            [
                'user_id'         => $request->user()->id,
                'instrumental_id' => $instrumentalId,
            ],
            [
                'rating'  => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Avis enregistré.',
            'data'    => $review->load('user:id,name'),
        ]);
    }

    public function destroy(Request $request, int $instrumentalId): JsonResponse
    {
        $deleted = Review::where('user_id', $request->user()->id)
            ->where('instrumental_id', $instrumentalId)
            ->delete();

        return response()->json([
            'message' => $deleted ? 'Avis supprimé.' : 'Aucun avis trouvé.',
        ]);
    }

    public function myReview(Request $request, int $instrumentalId): JsonResponse
    {
        $review = Review::where('user_id', $request->user()->id)
            ->where('instrumental_id', $instrumentalId)
            ->first();

        return response()->json(['data' => $review]);
    }
}