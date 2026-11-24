<?php

namespace App\Mail;

use App\Models\ProducerRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProducerApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ProducerRequest $producerRequest) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 Vous êtes maintenant producteur sur Instrunaka !',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.producer-approved',
        );
    }
}