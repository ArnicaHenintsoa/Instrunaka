<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class MailServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (config('app.env') !== 'production') {
            $redirectTo = env('MAIL_REDIRECT_TO');
            if ($redirectTo) {
                Mail::alwaysTo($redirectTo);
            }
        }
    }
}