<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class ContactController extends Controller
{
    /**
     * Public contact form submit. Rate-limited per IP so a scripted
     * abuser can't fill the inbox. Always stores the row first; only
     * then attempts to email so a failed mail provider doesn't lose
     * the customer's message.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $key = 'contact:' . ($request->ip() ?? 'anonymous');
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Too many submissions. Please try again later.',
            ], 429);
        }
        RateLimiter::hit($key, 600); // 5 per 10 minutes

        $contact = ContactMessage::create([
            ...$data,
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 512),
        ]);

        // Email the shop owner. Wrapped in try/catch because misconfigured
        // mail must not surface as a 500 to the customer — the DB row is
        // the durable record. Errors get logged for ops to investigate.
        $to = env('MAIL_CONTACT_TO') ?: env('MAIL_FROM_ADDRESS');
        if ($to) {
            try {
                Mail::to($to)->send(new ContactMessageReceived($contact));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json([
            'message' => "Thanks, we'll be in touch.",
            'id' => $contact->id,
        ], 201);
    }

    /**
     * Admin: list contact messages, newest first. Filterable by unread.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $q = ContactMessage::query()->latest();
        if ($request->boolean('unread')) {
            $q->whereNull('read_at');
        }
        return response()->json($q->paginate(50));
    }

    /**
     * Admin: mark a message read or replied.
     */
    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'read' => 'sometimes|boolean',
            'replied' => 'sometimes|boolean',
        ]);

        $msg = ContactMessage::findOrFail($id);
        if (array_key_exists('read', $data)) {
            $msg->read_at = $data['read'] ? now() : null;
        }
        if (array_key_exists('replied', $data)) {
            $msg->replied_at = $data['replied'] ? now() : null;
        }
        $msg->save();

        return response()->json($msg);
    }

    public function adminDestroy(int $id): JsonResponse
    {
        ContactMessage::where('id', $id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
