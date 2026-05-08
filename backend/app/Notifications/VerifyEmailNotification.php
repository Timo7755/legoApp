<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmail
{
    protected function verificationUrl($notifiable): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
    
        $apiUrl = url("/api/email/verify/{$notifiable->getKey()}/" . sha1($notifiable->getEmailForVerification()));
    
        return $frontendUrl . '/email/verify?url=' . urlencode($apiUrl);
    }

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify your LegoApp email')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email', $verificationUrl)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not create an account, no further action is required.');
    }
}