<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stock;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        // TODO: Seed popular Vietnamese stocks
        $stocks = [
            ['symbol' => 'VNM', 'name' => 'Vinamilk', 'exchange' => 'HOSE', 'sector' => 'Consumer Goods'],
            ['symbol' => 'VCB', 'name' => 'Vietcombank', 'exchange' => 'HOSE', 'sector' => 'Banking'],
            ['symbol' => 'HPG', 'name' => 'Hoa Phat Group', 'exchange' => 'HOSE', 'sector' => 'Steel'],
            // Add more stocks
        ];

        foreach ($stocks as $stock) {
            Stock::create($stock);
        }
    }
}
