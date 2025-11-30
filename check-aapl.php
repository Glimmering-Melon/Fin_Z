<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Stock;
use App\Models\StockPrice;

echo "Checking AAPL in database...\n\n";

$stock = Stock::where('symbol', 'AAPL')->first();

if ($stock) {
    echo "✓ Found AAPL (ID: {$stock->id})\n";
    echo "  Name: {$stock->name}\n";
    
    $pricesCount = $stock->prices()->count();
    echo "  Prices count: {$pricesCount}\n";
    
    if ($pricesCount > 0) {
        $latest = $stock->prices()->orderBy('date', 'desc')->first();
        $oldest = $stock->prices()->orderBy('date', 'asc')->first();
        
        echo "  Date range: {$oldest->date} to {$latest->date}\n";
        echo "  Latest close: \${$latest->close}\n";
    }
} else {
    echo "✗ AAPL not found in database\n";
    echo "\nAvailable stocks:\n";
    $stocks = Stock::all();
    foreach ($stocks as $s) {
        echo "  - {$s->symbol} ({$s->name})\n";
    }
}
