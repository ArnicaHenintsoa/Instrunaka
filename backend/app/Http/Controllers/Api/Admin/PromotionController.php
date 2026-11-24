<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        $promotions = Promotion::with('instrumental:id,title')
            ->latest()
            ->get();
        return response()->json(['data' => $promotions]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instrumental_id'  => 'required|exists:instrumentals,id',
            'discount_percent' => 'required|integer|min:1|max:90',
            'starts_at'        => 'required|date',
            'ends_at'          => 'required|date|after:starts_at',
        ]);

        $promotion = Promotion::create($validated);

        AuditLogger::log('promotion.created', $promotion, [
            'discount_percent' => $promotion->discount_percent,
        ]);

        return response()->json([
            'message' => 'Promotion créée.',
            'data'    => $promotion->load('instrumental:id,title'),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        AuditLogger::log('promotion.deleted', $promotion);
        $promotion->delete();

        return response()->json(['message' => 'Promotion supprimée.']);
    }
}