<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    /**
     * Vérifie si un code promo est valide (utilisateur connecté).
     */
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $promo = PromoCode::where('code', strtoupper($validated['code']))->first();

        if (!$promo) {
            return response()->json(['message' => 'Code promo introuvable.'], 404);
        }

        if (!$promo->isValid()) {
            return response()->json(['message' => 'Ce code promo n\'est plus valide.'], 400);
        }

        return response()->json([
            'message'          => 'Code promo appliqué !',
            'code'             => $promo->code,
            'discount_percent' => $promo->discount_percent,
        ]);
    }
}