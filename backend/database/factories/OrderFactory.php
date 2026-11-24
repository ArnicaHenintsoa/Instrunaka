<?php

namespace Database\Factories;

use App\Models\Instrumental;
use App\Models\Order;
use App\Models\Pack;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'reference'       => 'ORD-' . now()->format('Ymd') . '-' . strtoupper(fake()->bothify('??????')),
            'user_id'         => User::factory(),
            'instrumental_id' => Instrumental::factory(),
            'pack_id'         => null,
            'type'            => 'non_exclusive',
            'amount'          => 7000,
            'original_amount' => 7000,
            'discount_amount' => 0,
            'status'          => 'pending',
        ];
    }

    public function validated(): static
    {
        return $this->state(fn () => [
            'status'       => 'validated',
            'validated_at' => now(),
        ]);
    }

    public function exclusive(): static
    {
        return $this->state(fn () => [
            'type'            => 'exclusive',
            'amount'          => 20000,
            'original_amount' => 20000,
        ]);
    }

    public function pack(): static
    {
        return $this->state(fn () => [
            'type'            => 'pack',
            'instrumental_id' => null,
            'pack_id'         => Pack::factory(),
            'amount'          => 20000,
            'original_amount' => 20000,
        ]);
    }
}