<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

echo "Debug Finnhub API\n";
echo "=================\n\n";

$apiKey = env('STOCK_API_KEY');
$apiUrl = env('STOCK_API_URL');

echo "API URL: {$apiUrl}\n";
echo "API Key: {$apiKey}\n\n";

// Test simple call
$symbol = 'AAPL';
$to = time();
$from = strtotime('-1 day');

echo "Testing: {$symbol}\n";
echo "From: " . date('Y-m-d H:i', $from) . "\n";
echo "To: " . date('Y-m-d H:i', $to) . "\n\n";

$url = "{$apiUrl}/stock/candle";
$params = [
    'symbol' => $symbol,
    'resolution' => '1',
    'from' => $from,
    'to' => $to,
    'token' => $apiKey
];

echo "URL: {$url}\n";
echo "Params: " . json_encode($params, JSON_PRETTY_PRINT) . "\n\n";

$response = Http::withoutVerifying()->get($url, $params);

echo "Status: " . $response->status() . "\n";
echo "Response:\n";
echo json_encode($response->json(), JSON_PRETTY_PRINT) . "\n";
