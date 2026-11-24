<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Download;
use App\Models\Instrumental;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'instrumentals' => Instrumental::where('status', 'available')->count(),
            'producers'     => Producer::count(),
            'downloads'     => Download::count(),
        ]);
    }
}