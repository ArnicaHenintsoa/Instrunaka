<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Mood;
use App\Models\Rhythm;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class ClassificationController extends Controller
{
    public function genres(): JsonResponse
    {
        return response()->json([
            'data' => Genre::orderBy('label')->get(['id', 'name', 'label']),
        ]);
    }

    public function moods(): JsonResponse
    {
        return response()->json([
            'data' => Mood::orderBy('label')->get(['id', 'name', 'label']),
        ]);
    }

    public function rhythms(): JsonResponse
    {
        return response()->json([
            'data' => Rhythm::orderBy('id')->get(['id', 'name', 'label']),
        ]);
    }

    public function tags(): JsonResponse
    {
        return response()->json([
            'data' => Tag::orderBy('label')->get(['id', 'name', 'label']),
        ]);
    }
}