<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ProducerApprovedMail;
use App\Models\ProducerRequest;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ProducerRequestController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = ProducerRequest::with(['user:id,name,email,is_producer'])
            ->latest()
            ->paginate(20);

        return response()->json($requests);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $producerRequest = ProducerRequest::findOrFail($id);

        $producerRequest->update([
            'status'      => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $producerRequest->user->update(['is_producer' => true]);

        if (!$producerRequest->user->producer) {
            $producerRequest->user->producer()->create([
                'display_name' => $producerRequest->user->name,
                'bio'          => $producerRequest->bio,
                'verified'     => false,
            ]);
        }

        // Audit + email
        AuditLogger::log('producer_request.approved', $producerRequest);
        Mail::to($producerRequest->user->email)->send(new ProducerApprovedMail($producerRequest));

        return response()->json([
            'message' => 'Demande approuvée. L\'utilisateur est maintenant producteur.',
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'admin_note' => 'required|string|max:1000',
        ]);

        $producerRequest = ProducerRequest::findOrFail($id);

        $producerRequest->update([
            'status'      => 'rejected',
            'admin_note'  => $validated['admin_note'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        AuditLogger::log('producer_request.rejected', $producerRequest);

        return response()->json([
            'message' => 'Demande refusée.',
        ]);
    }
}