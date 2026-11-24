<?php

namespace App\Services;

use App\Exceptions\OrderException;
use App\Exceptions\UnauthorizedOrderActionException;
use App\Models\Instrumental;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\OrderItem;
use App\Models\Pack;

class OrderService
{
    public const TYPE_NON_EXCLUSIVE = 'non_exclusive';
    public const TYPE_EXCLUSIVE     = 'exclusive';

    public function createOrder(User $user, int $instrumentalId, string $type, ?string $promoCode = null): Order
    {
        if (! in_array($type, [self::TYPE_NON_EXCLUSIVE, self::TYPE_EXCLUSIVE], true)) {
            throw ValidationException::withMessages([
                'type' => ['Type d\'achat invalide.'],
            ]);
        }

        return DB::transaction(function () use ($user, $instrumentalId, $type, $promoCode) {
            $instrumental = Instrumental::where('id', $instrumentalId)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $instrumental->isAvailable()) {
                throw ValidationException::withMessages([
                    'instrumental' => ['Cette instrumentale n\'est plus disponible.'],
                ]);
            }

           
            $existing = Order::where('user_id', $user->id)
                ->where('instrumental_id', $instrumental->id)
                ->where('type', $type)
                ->where('status', 'pending')
                ->first();

            if ($existing) {
                return $existing;
            }

            if ($type === self::TYPE_NON_EXCLUSIVE) {
                $alreadyPurchased = Order::where('user_id', $user->id)
                    ->where('instrumental_id', $instrumental->id)
                    ->where('status', 'validated')
                    ->where('type', self::TYPE_NON_EXCLUSIVE)
                    ->exists();

                if ($alreadyPurchased) {
                    throw ValidationException::withMessages([
                        'instrumental' => ['Vous avez déjà acheté cette instrumentale.'],
                    ]);
                }
            }

            $baseAmount = (int) ($type === self::TYPE_EXCLUSIVE
                ? ($instrumental->exclusive_price ?: Config::get('platform.prices.exclusive'))
                : ($instrumental->non_exclusive_price ?: Config::get('platform.prices.non_exclusive')));

            $discountAmount = 0;
            $promoCodeId = null;

            if ($promoCode) {
                $promo = PromoCode::where('code', strtoupper($promoCode))
                    ->lockForUpdate()
                    ->first();

                if (! $promo || ! $promo->isValid()) {
                    throw ValidationException::withMessages([
                        'promo_code' => ['Ce code promo est invalide ou expiré.'],
                    ]);
                }

                $discountAmount = (int) round(($baseAmount * $promo->discount_percent) / 100);
                $promoCodeId = $promo->id;
                $promo->increment('used_count');
            }

            $finalAmount = $baseAmount - $discountAmount;

            return Order::create([
                'reference'         => $this->generateReference(),
                'user_id'           => $user->id,
                'instrumental_id'   => $instrumental->id,
                'type'              => $type,
                'amount'            => $finalAmount,
                'original_amount'   => $baseAmount,
                'discount_amount'   => $discountAmount,
                'promo_code_id'     => $promoCodeId,
                'status'            => 'pending',
            ]);
        });
    }

  
    public function createPackOrder(User $user, int $packId, ?string $promoCode = null): Order
    {
        return DB::transaction(function () use ($user, $packId, $promoCode) {
            $pack = Pack::with('instrumentals')->lockForUpdate()->findOrFail($packId);

          
            if (!Config::get('platform.features.packs_enabled')) {
                throw ValidationException::withMessages([
                    'pack' => ['Les packs ne sont pas disponibles pour le moment.'],
                ]);
            }

            
            if (!$pack->active) {
                throw ValidationException::withMessages([
                    'pack' => ['Ce pack n\'est plus disponible.'],
                ]);
            }

          
            foreach ($pack->instrumentals as $instrumental) {
                if (!$instrumental->isAvailable()) {
                    throw ValidationException::withMessages([
                        'pack' => ['Une des instrumentales de ce pack n\'est plus disponible.'],
                    ]);
                }
            }

            $existing = Order::where('user_id', $user->id)
                ->where('pack_id', $pack->id)
                ->where('type', 'pack')
                ->where('status', 'pending')
                ->first();

            if ($existing) {
                return $existing;
            }

            $baseAmount = (int) $pack->price;
            $discountAmount = 0;
            $promoCodeId = null;

            if ($promoCode) {
                $promo = PromoCode::where('code', strtoupper($promoCode))
                    ->lockForUpdate()
                    ->first();

                if (!$promo || !$promo->isValid()) {
                    throw ValidationException::withMessages([
                        'promo_code' => ['Ce code promo est invalide ou expiré.'],
                    ]);
                }

                $discountAmount = (int) round(($baseAmount * $promo->discount_percent) / 100);
                $promoCodeId = $promo->id;
                $promo->increment('used_count');
            }

            $finalAmount = $baseAmount - $discountAmount;

            $order = Order::create([
                'reference'         => $this->generateReference(),
                'user_id'           => $user->id,
                'pack_id'           => $pack->id,
                'instrumental_id'   => null,
                'type'              => 'pack',
                'amount'            => $finalAmount,
                'original_amount'   => $baseAmount,
                'discount_amount'   => $discountAmount,
                'promo_code_id'     => $promoCodeId,
                'status'            => 'pending',
            ]);

           
            foreach ($pack->instrumentals as $instrumental) {
                OrderItem::create([
                    'order_id'        => $order->id,
                    'instrumental_id' => $instrumental->id,
                    'price'           => $instrumental->non_exclusive_price,
                ]);
            }

            return $order;
        });
    }

    
    public function validateOrder(
        Order $order,
        User $admin,
        string $senderReference,
        int $receivedAmount,
        ?string $note = null
    ): Order {
        if (! $admin->isAdmin()) {
            throw new UnauthorizedOrderActionException('Seul un administrateur peut valider une commande.');
        }

        return DB::transaction(function () use ($order, $admin, $senderReference, $receivedAmount, $note) {
          
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();
            $instrumental = Instrumental::where('id', $lockedOrder->instrumental_id)
                ->lockForUpdate()
                ->firstOrFail();

            
            if ($lockedOrder->status !== 'pending') {
                throw new OrderException('Cette commande n\'est plus en attente.');
            }

          
            if (! $instrumental->isAvailable()) {
                throw new OrderException('Cette instrumentale n\'est plus disponible.');
            }

            if ($receivedAmount !== $lockedOrder->amount) {
                throw new OrderException(
                    "Le montant reçu ({$receivedAmount} Ar) ne correspond pas au montant attendu ({$lockedOrder->amount} Ar)."
                );
            }

            if ($lockedOrder->isExclusive()) {
                $instrumental->update(['status' => 'sold_exclusive']);

                $otherPending = Order::where('instrumental_id', $instrumental->id)
                    ->where('id', '!=', $lockedOrder->id)
                    ->where('status', 'pending')
                    ->get();

                foreach ($otherPending as $other) {
                    $this->releasePromo($other);
                    $other->update([
                        'status'          => 'cancelled',
                        'refund_required' => true,
                        'admin_note'      => 'Instrumentale vendue en exclusivité par un autre acheteur.',
                    ]);
                }
            }

            Payment::create([
                'order_id'         => $lockedOrder->id,
                'amount'           => $receivedAmount,
                'sender_reference' => $senderReference,
                'confirmed_by'     => $admin->id,
                'confirmed_at'     => now(),
            ]);

           
            $lockedOrder->update([
                'status'       => 'validated',
                'validated_by' => $admin->id,
                'validated_at' => now(),
                'admin_note'   => $note,
            ]);

            return $lockedOrder->fresh();
        });
    }

    public function rejectOrder(Order $order, User $admin, string $reason): Order
    {
        if (! $admin->isAdmin()) {
            throw new UnauthorizedOrderActionException('Seul un administrateur peut refuser une commande.');
        }

        if ($order->status !== 'pending') {
            throw new OrderException('Cette commande n\'est plus en attente.');
        }

        $order->update([
            'status'       => 'rejected',
            'validated_by' => $admin->id,
            'validated_at' => now(),
            'admin_note'   => $reason,
        ]);

        $this->releasePromo($order);

        return $order->fresh();
    }

    public function cancelOrder(Order $order, User $user): Order
    {
        if ($order->user_id !== $user->id) {
            throw new UnauthorizedOrderActionException('Vous ne pouvez annuler que vos propres commandes.');
        }

        if ($order->status !== 'pending') {
            throw new OrderException('Seules les commandes en attente peuvent être annulées.');
        }

        $order->update(['status' => 'cancelled']);

        $this->releasePromo($order);

        return $order->fresh();
    }

    public function releasePromo(Order $order): void
    {
        if ($order->promo_code_id) {
            PromoCode::where('id', $order->promo_code_id)
                ->where('used_count', '>', 0)
                ->decrement('used_count');
        }
    }

    private function generateReference(): string
    {
        do {
            $reference = sprintf(
                'ORD-%s-%s',
                now()->format('Ymd'),
                strtoupper(substr(bin2hex(random_bytes(4)), 0, 6))
            );
        } while (Order::where('reference', $reference)->exists());

        return $reference;
    }
}