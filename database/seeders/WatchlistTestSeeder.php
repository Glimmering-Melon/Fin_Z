<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Stock;
use App\Models\StockPrice;
use App\Models\Watchlist;
use Carbon\Carbon;

class WatchlistTestSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo user test
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // Tạo sample stocks
        $stocks = [
            ['symbol' => 'VNM', 'name' => 'Vinamilk', 'exchange' => 'HOSE', 'sector' => 'Consumer Goods'],
            ['symbol' => 'VIC', 'name' => 'Vingroup', 'exchange' => 'HOSE', 'sector' => 'Real Estate'],
            ['symbol' => 'HPG', 'name' => 'Hoa Phat Group', 'exchange' => 'HOSE', 'sector' => 'Materials'],
            ['symbol' => 'VHM', 'name' => 'Vinhomes', 'exchange' => 'HOSE', 'sector' => 'Real Estate'],
            ['symbol' => 'FPT', 'name' => 'FPT Corporation', 'exchange' => 'HOSE', 'sector' => 'Technology'],
        ];

        foreach ($stocks as $stockData) {
            $stock = Stock::firstOrCreate(
                ['symbol' => $stockData['symbol']],
                $stockData
            );

            // Tạo giá hôm qua
            StockPrice::firstOrCreate(
                [
                    'stock_id' => $stock->id,
                    'date' => Carbon::yesterday(),
                ],
                [
                    'open' => rand(50000, 100000) / 1000,
                    'high' => rand(50000, 100000) / 1000,
                    'low' => rand(50000, 100000) / 1000,
                    'close' => rand(50000, 100000) / 1000,
                    'volume' => rand(1000000, 10000000),
                ]
            );

            // Tạo giá hôm nay (có thay đổi)
            $yesterdayPrice = StockPrice::where('stock_id', $stock->id)
                ->where('date', Carbon::yesterday())
                ->first();

            $changePercent = rand(-5, 10); // -5% đến +10%
            $todayClose = $yesterdayPrice->close * (1 + $changePercent / 100);

            StockPrice::firstOrCreate(
                [
                    'stock_id' => $stock->id,
                    'date' => Carbon::today(),
                ],
                [
                    'open' => $todayClose * 0.98,
                    'high' => $todayClose * 1.02,
                    'low' => $todayClose * 0.97,
                    'close' => $todayClose,
                    'volume' => rand(1000000, 10000000),
                ]
            );
        }

        // Thêm 2-3 stocks vào watchlist
        $stocksToWatch = Stock::whereIn('symbol', ['VNM', 'FPT', 'HPG'])->get();
        foreach ($stocksToWatch as $stock) {
            Watchlist::firstOrCreate([
                'user_id' => $user->id,
                'stock_id' => $stock->id,
            ]);
        }

        $this->command->info('✅ Test data created successfully!');
        $this->command->info('📧 Email: test@example.com');
        $this->command->info('🔑 Password: password');
    }
}
