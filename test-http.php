<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('STOCK_API_KEY');
$apiUrl = env('STOCK_API_URL');

echo "Testing direct HTTP call to Polygon.io...\n\n";

// Test 1: Price
$url1 = "{$apiUrl}/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey={$apiKey}";
echo "URL: {$url1}\n\n";

$response1 = Http::get($url1);
echo "Status: " . $response1->status() . "\n";
echo "Response:\n" . json_encode($response1->json(), JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Search
$url2 = "{$apiUrl}/v3/reference/tickers?search=apple&active=true&limit=3&apiKey={$apiKey}";
echo "URL: {$url2}\n\n";

$response2 = Http::get($url2);
echo "Status: " . $response2->status() . "\n";
echo "Response:\n" . json_encode($response2->json(), JSON_PRETTY_PRINT) . "\n";
