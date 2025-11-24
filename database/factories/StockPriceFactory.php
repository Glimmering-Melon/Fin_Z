<?php

namespace Database\Factories;

use App\Models\Stock;
use App\Models\StockPrice;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockPriceFactory extends Factory
{
    protected $model = StockPrice::class;

    public function definition(): array
    {
        $open = $this->faker->randomFloat(2, 10, 200);
        $high = $open + $this->faker->randomFloat(2, 0, 10);
        $low = $open - $this->faker->randomFloat(2, 0, 10);
        $close = $this->faker->randomFloat(2, $low, $high);

        return [
            'stock_id' => Stock::factory(),
            'date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'open' => $open,
            'high' => $high,
            'low' => $low,
            'close' => $close,
            'volume' => $this->faker->numberBetween(100000, 10000000),
        ];
    }
}
