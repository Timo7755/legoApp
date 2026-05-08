<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PendingEmailVerificationNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        $url = url("/api/email/verify-pending/{$notifiable->getKey()}/" . sha1($notifiable->pending_email));

        $verifyUrl = $frontendUrl . '/email/verify-pending?url=' . urlencode($url);

        return (new MailMessage)
            ->subject('Confirm your new email address')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('We received a request to change your email address to: ' . $notifiable->pending_email)
            ->action('Confirm new email', $verifyUrl)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not request this change, ignore this email.');
    }
}