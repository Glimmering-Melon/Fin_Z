<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DATABASE CHECK ===\n\n";

$stockCount = App\Models\Stock::count();
$priceCount = App\Models\StockPrice::count();

echo "Stocks: {$stockCount}\n";
echo "Stock Prices: {$priceCount}\n\n";

if ($stockCount > 0) {
    echo "Sample Stock:\n";
    $stock = App\Models\Stock::first();
    echo "  Symbol: {$stock->symbol}\n";
    echo "  Name: {$stock->name}\n";
    echo "  Exchange: {$stock->exchange}\n";
    echo "  Sector: {$stock->sector}\n\n";
    
    $priceCount = $stock->prices()->count();
    echo "  Price records: {$priceCount}\n";
    
    if ($priceCount > 0) {
        $latestPrice = $stock->prices()->latest('date')->first();
        echo "  Latest price: " . number_format($latestPrice->close) . " VND\n";
        echo "  Date: {$latestPrice->date}\n";
    }
} else {
    echo "⚠️  No data found. Please run:\n";
    echo "   php artisan db:seed --class=StockSeeder\n";
}

echo "\n=== END ===\n";
