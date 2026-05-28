<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Email body that lands in the shop owner's inbox each time a customer
 * fills the contact form. Plain text — keeps it dependable across
 * providers and avoids the spam-folder roulette HTML mail invites.
 */
class ContactMessageReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contact)
    {
    }

    public function build()
    {
        $body = <<<TXT
New contact form submission on FutureShop.

From:    {$this->contact->name} <{$this->contact->email}>
Subject: {$this->contact->subject}

{$this->contact->message}

----
Sent {$this->contact->created_at}
IP: {$this->contact->ip}
TXT;

        return $this->subject('[FutureShop] ' . $this->contact->subject)
            ->replyTo($this->contact->email, $this->contact->name)
            ->text('emails.contact_plain', ['body' => $body]);
    }
}
