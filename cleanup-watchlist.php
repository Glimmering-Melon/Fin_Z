<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Watchlist;
use App\Models\Stock;

echo "Cleaning up Watchlist\n";
echo "=====================\n\n";

// Find stocks without price data
$stocksWithoutData = Stock::doesntHave('prices')->pluck('id');

echo "Stocks without price data: " . $stocksWithoutData->count() . "\n";
foreach ($stocksWithoutData as $stockId) {
    $stock = Stock::find($stockId);
    echo "  - {$stock->symbol}: {$stock->name}\n";
}
echo "\n";

// Find watchlist items with these stocks
$watchlistItems = Watchlist::whereIn('stock_id', $stocksWithoutData)->get();

echo "Watchlist items to remove: " . $watchlistItems->count() . "\n";
foreach ($watchlistItems as $item) {
    echo "  - User {$item->user_id}: {$item->stock->symbol}\n";
}
echo "\n";

if ($watchlistItems->count() > 0) {
    echo "Removing these items from watchlist...\n";
    Watchlist::whereIn('stock_id', $stocksWithoutData)->delete();
    echo "✓ Removed {$watchlistItems->count()} items\n";
} else {
    echo "✓ No items to remove\n";
}

echo "\n✓ Cleanup complete!\n";
