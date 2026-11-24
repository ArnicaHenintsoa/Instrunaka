<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPasswordNotification;
use Illuminate\Notifications\Messages\MailMessage;


class ResetPasswordNotification extends BaseResetPasswordNotification
{
    public function toMail($notifiable)
    {
    
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
       
        $url = $frontendUrl . '/reinitialiser-mot-de-passe?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe Instrunaka')
            ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.')
            ->action('Réinitialiser mon mot de passe', $url)
            ->line('Ce lien expirera dans 60 minutes.')
            ->line('Si vous n\'êtes pas à l\'origine de cette demande, aucune action n\'est nécessaire.');
    }
}