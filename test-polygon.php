<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = new \App\Services\StockPriceService();

echo "Testing Polygon.io API...\n\n";

// Test price
echo "1. Testing getRealTimePrice('AAPL'):\n";
$price = $service->getRealTimePrice('AAPL');
echo json_encode($price, JSON_PRETTY_PRINT) . "\n\n";

// Test search
echo "2. Testing searchStocks('apple'):\n";
$search = $service->searchStocks('apple');
echo json_encode($search, JSON_PRETTY_PRINT) . "\n\n";

echo "Done!\n";
