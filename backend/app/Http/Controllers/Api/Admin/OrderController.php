<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrderValidatedMail;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Order;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

     public function index(Request $request): JsonResponse
    {
        $orders = Order::with([
                'user:id,name,email', 
                'instrumental:id,title',
                'pack:id,name',
                'items.instrumental:id,title'
            ])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('refund_required'), fn($q) => $q->where('refund_required', true))
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function validate(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'sender_reference' => 'required|string|max:255',
            'received_amount'  => 'required|integer|min:0',
            'note'             => 'nullable|string|max:1000',
        ]);

        $order = Order::findOrFail($id);

        $order = $this->orderService->validateOrder(
            $order,
            $request->user(),
            $validated['sender_reference'],
            $validated['received_amount'],
            $validated['note'] ?? null
        );

        // Email de validation (dans un try/catch pour ne pas faire échouer la requête)
        try {
            Mail::to($order->user->email)->send(new OrderValidatedMail($order));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi mail OrderValidated: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Commande validée.',
            'data'    => $order,
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $order = Order::findOrFail($id);

        $order = $this->orderService->rejectOrder(
            $order,
            $request->user(),
            $validated['reason']
        );

        return response()->json([
            'message' => 'Commande refusée.',
            'data'    => $order,
        ]);
    }
}