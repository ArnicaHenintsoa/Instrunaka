<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Config;

class PackController extends Controller
{
    public function index(): JsonResponse
    {
        if (!Config::get('platform.features.packs_enabled')) {
            return response()->json([
                'message' => 'Les packs ne sont pas encore disponibles.',
                'data'    => [],
            ]);
        }

        $packs = Pack::with('instrumentals:id,title,cover_path,non_exclusive_price,producer_id')
            ->with('instrumentals.producer:id,display_name')
            ->with('instrumentals.genre:id,label')
            ->where('active', true)
            ->latest()
            ->get();

        return response()->json(['data' => $packs]);
    }

    public function show(int $id): JsonResponse
    {
        if (!Config::get('platform.features.packs_enabled')) {
            return response()->json([
                'message' => 'Les packs ne sont pas encore disponibles.',
            ], 404);
        }

        $pack = Pack::with('instrumentals:id,title,cover_path,non_exclusive_price,producer_id')
            ->with('instrumentals.producer:id,display_name')
            ->with('instrumentals.genre:id,label')
            ->where('active', true)
            ->findOrFail($id);

        return response()->json(['data' => $pack]);
    }
}