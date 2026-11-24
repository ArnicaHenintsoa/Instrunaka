<?php

namespace Database\Factories;

use App\Models\Instrumental;
use App\Models\Producer;
use Illuminate\Database\Eloquent\Factories\Factory;

class InstrumentalFactory extends Factory
{
    protected $model = Instrumental::class;

    public function definition(): array
    {
        return [
            'producer_id'         => Producer::factory(),
            'title'               => fake()->sentence(3),
            'description'         => fake()->paragraph(),
            'bpm'                 => fake()->numberBetween(70, 160),
            'musical_key'         => fake()->randomElement(['C min', 'Am', 'G maj', 'D min']),
            'duration_seconds'    => fake()->numberBetween(120, 300),
            'non_exclusive_price' => 7000,
            'exclusive_price'     => 20000,
            'status'              => 'available',
            'published_at'        => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending', 'published_at' => null]);
    }

    public function soldExclusive(): static
    {
        return $this->state(fn () => ['status' => 'sold_exclusive']);
    }
}