<?php

namespace Database\Factories;

use App\Models\Producer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProducerFactory extends Factory
{
    protected $model = Producer::class;

    public function definition(): array
    {
        return [
            'user_id'      => User::factory(),
            'display_name' => fake()->name(),
            'bio'          => fake()->paragraph(),
            'verified'     => false,
        ];
    }
}