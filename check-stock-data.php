<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Stock;
use App\Models\StockPrice;

echo "Checking Stock Data\n";
echo "===================\n\n";

$stocks = Stock::all();

foreach ($stocks as $stock) {
    $priceCount = StockPrice::where('stock_id', $stock->id)->count();
    $status = $priceCount > 0 ? "✓" : "✗";
    
    echo "{$status} {$stock->symbol} ({$stock->name}): {$priceCount} price records\n";
    
    if ($priceCount > 0) {
        $latest = StockPrice::where('stock_id', $stock->id)
            ->orderBy('date', 'desc')
            ->first();
        echo "   Latest: {$latest->date->format('Y-m-d')} - Close: \${$latest->close}\n";
    }
}

echo "\n";
echo "Summary:\n";
echo "--------\n";
$withData = Stock::whereHas('prices')->count();
$withoutData = Stock::count() - $withData;
echo "Stocks with data: {$withData}\n";
echo "Stocks without data: {$withoutData}\n";
