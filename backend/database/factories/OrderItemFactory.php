<?php

namespace Database\Factories;

use App\Models\Instrumental;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id'        => Order::factory(),
            'instrumental_id' => Instrumental::factory(),
            'price'           => $this->faker->numberBetween(5000, 15000),
        ];
    }
}