<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stock;
use App\Models\StockPrice;
use Carbon\Carbon;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding stocks...');
        
        $stocks = [
            ['symbol' => 'VNM', 'name' => 'Vinamilk', 'exchange' => 'HOSE', 'sector' => 'Consumer Goods', 'base_price' => 80000],
            ['symbol' => 'VCB', 'name' => 'Vietcombank', 'exchange' => 'HOSE', 'sector' => 'Banking', 'base_price' => 90000],
            ['symbol' => 'HPG', 'name' => 'Hoa Phat Group', 'exchange' => 'HOSE', 'sector' => 'Steel', 'base_price' => 25000],
            ['symbol' => 'VHM', 'name' => 'Vinhomes', 'exchange' => 'HOSE', 'sector' => 'Real Estate', 'base_price' => 45000],
            ['symbol' => 'TCB', 'name' => 'Techcombank', 'exchange' => 'HOSE', 'sector' => 'Banking', 'base_price' => 50000],
            ['symbol' => 'MSN', 'name' => 'Masan Group', 'exchange' => 'HOSE', 'sector' => 'Consumer Goods', 'base_price' => 70000],
            ['symbol' => 'VIC', 'name' => 'Vingroup', 'exchange' => 'HOSE', 'sector' => 'Conglomerate', 'base_price' => 40000],
            ['symbol' => 'GAS', 'name' => 'PetroVietnam Gas', 'exchange' => 'HOSE', 'sector' => 'Oil & Gas', 'base_price' => 95000],
            ['symbol' => 'MBB', 'name' => 'Military Bank', 'exchange' => 'HOSE', 'sector' => 'Banking', 'base_price' => 28000],
            ['symbol' => 'SAB', 'name' => 'Sabeco', 'exchange' => 'HOSE', 'sector' => 'Beverage', 'base_price' => 150000],
        ];

        foreach ($stocks as $stockData) {
            $basePrice = $stockData['base_price'];
            unset($stockData['base_price']);
            
            $stock = Stock::create($stockData);
            $this->command->info("Created stock: {$stock->symbol}");
            
            // Create 365 days of price history
            $this->createPriceHistory($stock, $basePrice, 365);
        }
        
        $this->command->info('Seeding completed!');
    }
    
    private function createPriceHistory(Stock $stock, float $basePrice, int $days): void
    {
        $startDate = Carbon::now()->subDays($days);
        $currentPrice = $basePrice;
        
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            
            // Skip weekends
            if ($date->isWeekend()) {
                continue;
            }
            
            // Random price movement (-2% to +2%)
            $change = $currentPrice * (rand(-200, 200) / 10000);
            $currentPrice += $change;
            
            // Ensure price doesn't go too low
            if ($currentPrice < $basePrice * 0.5) {
                $currentPrice = $basePrice * 0.5;
            }
            
            // Ensure price doesn't go too high
            if ($currentPrice > $basePrice * 1.5) {
                $currentPrice = $basePrice * 1.5;
            }
            
            $open = $currentPrice;
            $close = $currentPrice + ($currentPrice * (rand(-100, 100) / 10000));
            $high = max($open, $close) * (1 + rand(0, 50) / 10000);
            $low = min($open, $close) * (1 - rand(0, 50) / 10000);
            $volume = rand(100000, 5000000);
            
            StockPrice::create([
                'stock_id' => $stock->id,
                'date' => $date->format('Y-m-d'),
                'open' => round($open, 2),
                'high' => round($high, 2),
                'low' => round($low, 2),
                'close' => round($close, 2),
                'volume' => $volume,
            ]);
            
            $currentPrice = $close;
        }
        
        $this->command->info("  Created price history for {$stock->symbol}");
    }
}
