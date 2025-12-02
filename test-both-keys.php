<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

$apiUrl = 'https://finnhub.io/api/v1';

$keys = [
    'Key 1' => 'd4l7jr1r01qt7v191kdg',
    'Key 2' => 'd4l7jr1r01qt7v191ke0',
    'Combined' => 'd4l7jr1r01qt7v191kdgd4l7jr1r01qt7v191ke0',
];

$to = time();
$from = strtotime('-30 days');

foreach ($keys as $name => $key) {
    echo "\nTesting {$name}: {$key}\n";
    echo str_repeat('-', 50) . "\n";
    
    $response = Http::withoutVerifying()->get("{$apiUrl}/stock/candle", [
        'symbol' => 'AAPL',
        'resolution' => 'D',
        'from' => $from,
        'to' => $to,
        'token' => $key
    ]);
    
    echo "Status: " . $response->status() . "\n";
    
    if ($response->successful()) {
        $data = $response->json();
        if (isset($data['s']) && $data['s'] === 'ok') {
            echo "✅ SUCCESS! Got " . count($data['t']) . " candles\n";
        } else {
            echo "❌ Failed: " . json_encode($data) . "\n";
        }
    } else {
        echo "❌ Error: " . $response->body() . "\n";
    }
}
