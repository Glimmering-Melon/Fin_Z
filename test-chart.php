<?php

echo "Testing Chart Page\n";
echo "==================\n\n";

// Test 1: Check if chart page loads
echo "1. Testing chart page route\n";
$ch = curl_init('http://localhost:8000/chart');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    echo "✓ Chart page loads successfully\n";
} else {
    echo "✗ Chart page failed to load\n";
}
echo "\n";

// Test 2: Check watchlist API
echo "2. Testing watchlist API for chart\n";
$ch = curl_init('http://localhost:8000/api/user/watchlist');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "✓ Watchlist API works: " . count($data) . " stocks\n";
    echo "Stocks available for comparison:\n";
    foreach (array_slice($data, 0, 5) as $stock) {
        echo "  - {$stock['symbol']}: {$stock['name']}\n";
    }
} else {
    echo "✗ Watchlist API failed\n";
}
echo "\n";

// Test 3: Check stock history API for multiple stocks
echo "3. Testing stock history API for comparison\n";
$testSymbols = ['AAPL', 'MSFT'];
foreach ($testSymbols as $symbol) {
    $ch = curl_init("http://localhost:8000/api/stockdata/history/{$symbol}?days=90");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['success']) {
            echo "✓ {$symbol}: " . count($data['data']['timestamps']) . " data points\n";
        }
    } else {
        echo "✗ {$symbol}: Failed\n";
    }
}

echo "\n✓ All tests complete!\n";
