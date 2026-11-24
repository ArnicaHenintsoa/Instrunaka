<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Console\Command;

class ExpirePendingOrders extends Command
{
    protected $signature = 'instrunaka:expire-pending-orders';
    protected $description = 'Passe en "expired" les commandes pending de plus de 48h.';

    public function handle(OrderService $orders)
    {
        $count = 0;

        Order::where('status', 'pending')
            ->where('created_at', '<', now()->subHours(48))
            ->each(function (Order $order) use ($orders, &$count) {
                $orders->releasePromo($order);
                $order->update(['status' => 'expired']);
                $count++;
            });

        $this->info("{$count} commande(s) expirée(s).");
    }
}
