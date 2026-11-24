<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageMail;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Reçoit un message du formulaire de contact (public).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contactMessage = ContactMessage::create($validated);

        // Envoyer un email à l'admin
        $adminEmail = config('mail.from.address');
        Mail::to($adminEmail)->send(new ContactMessageMail($contactMessage));

        return response()->json([
            'message' => 'Message envoyé. Nous vous répondrons bientôt.',
        ], 201);
    }
}