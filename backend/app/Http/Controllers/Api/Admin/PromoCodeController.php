<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function index(): JsonResponse
    {
        $codes = PromoCode::latest()->get();
        return response()->json(['data' => $codes]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'             => 'required|string|unique:promo_codes,code|max:50',
            'discount_percent' => 'required|integer|min:1|max:100',
            'max_uses'         => 'nullable|integer|min:1',
            'expires_at'       => 'nullable|date|after:now',
        ]);

        $validated['code'] = strtoupper($validated['code']);

        $promo = PromoCode::create($validated);

        AuditLogger::log('promo_code.created', $promo, ['code' => $promo->code]);

        return response()->json([
            'message' => 'Code promo créé.',
            'data'    => $promo,
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $promo = PromoCode::findOrFail($id);
        AuditLogger::log('promo_code.deleted', $promo, ['code' => $promo->code]);
        $promo->delete();

        return response()->json(['message' => 'Code promo supprimé.']);
    }
}