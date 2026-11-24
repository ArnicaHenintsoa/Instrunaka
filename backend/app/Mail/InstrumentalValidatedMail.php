<?php

namespace App\Mail;

use App\Models\Instrumental;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InstrumentalValidatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Instrumental $instrumental,
        public bool $approved = true,
        public ?string $reason = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->approved
                ? '🎵 Votre instrumentale a été publiée !'
                : '❌ Votre instrumentale a été refusée',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.instrumental-validated',
        );
    }
}