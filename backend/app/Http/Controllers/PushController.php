<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushController extends Controller
{
    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'endpoint' => 'required|string',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
            'contentEncoding' => 'nullable|string',
        ]);

        PushSubscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'endpoint' => $data['endpoint'],
            ],
            [
                'public_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'content_encoding' => $data['contentEncoding'] ?? 'aesgcm',
            ]
        );

        return response()->json(['message' => 'Subscription enregistrée']);
    }

    public function unsubscribe(Request $request)
    {
        $request->validate(['endpoint' => 'required|string']);

        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $request->endpoint)
            ->delete();

        return response()->json(['message' => 'Subscription supprimée']);
    }

    public function send(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'body' => 'required|string',
            'url' => 'nullable|string',
        ]);

        $auth = [
            'VAPID' => [
                'subject' => env('VAPID_SUBJECT'),
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);

        $payload = json_encode([
            'title' => $data['title'],
            'body' => $data['body'],
            'url' => $data['url'] ?? '/',
        ]);

        $subscriptions = PushSubscription::all();

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding ?? 'aesgcm',
            ]);

            $webPush->queueNotification($subscription, $payload);
        }

        $results = [];
        foreach ($webPush->flush() as $report) {
            $results[] = [
                'endpoint' => $report->getEndpoint(),
                'success' => $report->isSuccess(),
            ];
        }

        return response()->json([
            'message' => 'Notifications envoyées',
            'results' => $results,
        ]);
    }
}