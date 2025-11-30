<?php

namespace Database\Factories;

use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockFactory extends Factory
{
    protected $model = Stock::class;

    public function definition(): array
    {
        return [
            'symbol' => strtoupper($this->faker->unique()->lexify('???')),
            'name' => $this->faker->company(),
            'exchange' => $this->faker->randomElement(['HOSE', 'HNX', 'UPCOM']),
            'sector' => $this->faker->randomElement([
                'Banking',
                'Technology',
                'Real Estate',
                'Manufacturing',
                'Retail',
                'Energy',
                'Healthcare'
            ]),
        ];
    }
}
