<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stock;

class TechStocksSeeder extends Seeder
{
    public function run(): void
    {
        $stocks = [
            ['symbol' => 'FPT', 'name' => 'FPT Corporation', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'CMG', 'name' => 'CMC Corporation', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'VGI', 'name' => 'Vietnam Gateway', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'SAM', 'name' => 'SACOM', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'ELC', 'name' => 'Elcom Corporation', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'ITD', 'name' => 'ITD Corporation', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'VNZ', 'name' => 'VINAZAMIN', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'SGT', 'name' => 'SAIGONTEL', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'FOX', 'name' => 'DIGIWORLD', 'exchange' => 'HOSE', 'sector' => 'Technology'],
            ['symbol' => 'VTC', 'name' => 'Vietnam Telecom', 'exchange' => 'HOSE', 'sector' => 'Technology'],
        ];

        foreach ($stocks as $stock) {
            Stock::updateOrCreate(
                ['symbol' => $stock['symbol']],
                $stock
            );
        }

        $this->command->info('Added ' . count($stocks) . ' technology stocks');
    }
}
