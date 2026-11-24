<?php

namespace Database\Factories;

use App\Models\Pack;
use Illuminate\Database\Eloquent\Factories\Factory;

class PackFactory extends Factory
{
    protected $model = Pack::class;

    public function definition(): array
    {
        return [
            'name'        => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'price'       => $this->faker->numberBetween(15000, 50000),
            'cover_path'  => null,
            'active'      => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['active' => false]);
    }
}