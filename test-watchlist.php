<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Watchlist;
use App\Models\Stock;

echo "Testing Watchlist Functionality\n";
echo "================================\n\n";

// Test 1: Check if stocks exist
echo "1. Checking stocks in database...\n";
$stocks = Stock::select('id', 'symbol', 'name')->limit(5)->get();
echo "Found " . $stocks->count() . " stocks:\n";
foreach ($stocks as $stock) {
    echo "  - {$stock->symbol}: {$stock->name} (ID: {$stock->id})\n";
}
echo "\n";

// Test 2: Add AAPL to watchlist
echo "2. Adding AAPL to watchlist for user 1...\n";
$stock = Stock::where('symbol', 'AAPL')->first();
if ($stock) {
    $exists = Watchlist::where('user_id', 1)->where('stock_id', $stock->id)->exists();
    if ($exists) {
        echo "  ✓ AAPL already in watchlist\n";
    } else {
        $watchlist = Watchlist::create([
            'user_id' => 1,
            'stock_id' => $stock->id,
        ]);
        echo "  ✓ Added AAPL to watchlist (ID: {$watchlist->id})\n";
    }
} else {
    echo "  ✗ AAPL not found in stocks table\n";
}
echo "\n";

// Test 3: List watchlist
echo "3. Current watchlist for user 1:\n";
$watchlist = Watchlist::where('user_id', 1)->with('stock')->get();
echo "Found " . $watchlist->count() . " items:\n";
foreach ($watchlist as $item) {
    echo "  - {$item->stock->symbol}: {$item->stock->name}\n";
}
echo "\n";

echo "✓ Test complete!\n";
