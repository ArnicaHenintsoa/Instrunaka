<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Mail\OrderPendingMail;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $type = $request->string('type')->toString();
        
        // Détecter si c'est un pack
        if ($type === 'pack') {
            $order = $this->orderService->createPackOrder(
                $request->user(),
                $request->integer('pack_id'),
                $request->input('promo_code')
            );
        } else {
            $order = $this->orderService->createOrder(
                $request->user(),
                $request->integer('instrumental_id'),
                $type,
                $request->input('promo_code')
            );
        }

        $order->load(['instrumental:id,title', 'pack:id,name', 'items.instrumental:id,title']);

        // Email de commande en attente
        try {
            Mail::to($order->user->email)->send(new OrderPendingMail($order));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi mail OrderPending: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Commande créée. En attente de validation.',
            'data'    => $this->formatOrder($order),
            'payment' => [
                'mobile_number' => Config::get('services.mobile_banking.number'),
                'holder_name'   => Config::get('services.mobile_banking.name'),
                'reference'     => $order->reference,
                'amount'        => $order->amount,
            ],
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['instrumental:id,title,cover_path', 'pack:id,name', 'items.instrumental:id,title'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $orders->map(fn ($o) => $this->formatOrder($o)),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
                'last_page'    => $orders->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['instrumental:id,title,cover_path', 'pack:id,name', 'items.instrumental:id,title'])
            ->findOrFail($id);

        return response()->json([
            'data' => $this->formatOrder($order),
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        $order = $this->orderService->cancelOrder($order, $request->user());

        return response()->json([
            'message' => 'Commande annulée.',
            'data'    => $this->formatOrder($order),
        ]);
    }

    private function formatOrder(Order $order): array
    {
        $data = [
            'id'              => $order->id,
            'reference'       => $order->reference,
            'type'            => $order->type,
            'amount'          => $order->amount,
            'original_amount' => $order->original_amount,
            'discount_amount' => $order->discount_amount,
            'promo_code_id'   => $order->promo_code_id,
            'status'          => $order->status,
            'instrumental'    => $order->relationLoaded('instrumental') && $order->instrumental
                ? ['id' => $order->instrumental->id, 'title' => $order->instrumental->title]
                : null,
            'validated_at'    => $order->validated_at?->toIso8601String(),
            'created_at'      => $order->created_at?->toIso8601String(),
        ];

        // Ajouter les infos du pack si c'est une commande pack
        if ($order->isPack()) {
            $data['pack'] = $order->relationLoaded('pack') && $order->pack
                ? ['id' => $order->pack->id, 'name' => $order->pack->name]
                : null;
            $data['items'] = $order->relationLoaded('items')
                ? $order->items->map(fn ($item) => [
                    'instrumental_id' => $item->instrumental_id,
                    'title'           => $item->instrumental?->title,
                    'price'           => $item->price,
                ])
                : [];
        }

        return $data;
    }
}