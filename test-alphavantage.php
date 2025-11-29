<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\AlphaVantageService;

echo "Testing Alpha Vantage API...\n\n";

$av = app(AlphaVantageService::class);

// Test 1: Get daily time series
echo "1. Getting daily time series for AAPL...\n";
$daily = $av->getDailyTimeSeries('AAPL', true);
if ($daily) {
    echo "✅ Success! Got " . count($daily['timestamps']) . " days of data\n";
    echo "   Latest date: " . end($daily['timestamps']) . "\n";
    echo "   Latest close: $" . end($daily['close']) . "\n\n";
} else {
    echo "❌ Failed (may have hit API limit)\n\n";
}

// Test 2: Get quote
echo "2. Getting quote for AAPL...\n";
$quote = $av->getQuote('AAPL');
if ($quote) {
    echo "✅ Success!\n";
    echo "   Price: $" . $quote['price'] . "\n";
    echo "   Change: " . ($quote['change'] >= 0 ? '+' : '') . $quote['change'] . " (" . $quote['changePercent'] . "%)\n\n";
} else {
    echo "❌ Failed\n\n";
}

// Test 3: Search symbols
echo "3. Searching for 'apple'...\n";
$results = $av->searchSymbols('apple');
if (!empty($results)) {
    echo "✅ Found " . count($results) . " results:\n";
    foreach (array_slice($results, 0, 3) as $result) {
        echo "   - " . ($result['1. symbol'] ?? 'N/A') . ": " . ($result['2. name'] ?? 'N/A') . "\n";
    }
    echo "\n";
} else {
    echo "❌ No results\n\n";
}

echo "✅ Alpha Vantage setup complete!\n\n";
echo "API Endpoints:\n";
echo "- GET /api/alphavantage/daily/{symbol}\n";
echo "- GET /api/alphavantage/intraday/{symbol}?interval=5min\n";
echo "- GET /api/alphavantage/quote/{symbol}\n";
echo "- GET /api/alphavantage/search?q=apple\n";
