<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('STOCK_API_KEY');
$apiUrl = env('STOCK_API_URL');

echo "Test Daily Resolution\n";
echo "=====================\n\n";

$to = time();
$from = strtotime('-30 days');

$response = Http::withoutVerifying()->get("{$apiUrl}/stock/candle", [
    'symbol' => 'AAPL',
    'resolution' => 'D',
    'from' => $from,
    'to' => $to,
    'token' => $apiKey
]);

echo "Status: " . $response->status() . "\n";
$data = $response->json();
echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

if (isset($data['s']) && $data['s'] === 'ok') {
    echo "✅ Success! Got " . count($data['t']) . " candles\n";
    echo "First: " . date('Y-m-d', $data['t'][0]) . "\n";
    echo "Last: " . date('Y-m-d', end($data['t'])) . "\n";
} else {
    echo "❌ Failed\n";
}
