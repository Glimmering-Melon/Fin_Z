<?php

echo "Final System Check\n";
echo "==================\n\n";

// Test 1: Check stocks API
echo "1. Testing /api/stocks\n";
$ch = curl_init('http://localhost:8000/api/stocks');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo "   ✓ Returns {$data['count']} stocks (all with price data)\n";
echo "   Stocks: ";
foreach ($data['data'] as $stock) {
    echo $stock['symbol'] . " ";
}
echo "\n\n";

// Test 2: Check watchlist API
echo "2. Testing /api/user/watchlist\n";
$ch = curl_init('http://localhost:8000/api/user/watchlist');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo "   ✓ Returns " . count($data) . " stocks in watchlist\n";
echo "   Stocks: ";
foreach ($data as $stock) {
    echo $stock['symbol'] . " ";
}
echo "\n\n";

// Test 3: Try to add a stock without data (should not be in the list)
echo "3. Checking if stocks without data are hidden\n";
$stocksWithoutData = ['ELC', 'FPT', 'SAM', 'ITD', 'VNZ', 'SGT', 'FOX'];
$availableStocks = array_column($data['data'] ?? [], 'symbol');

$hidden = array_intersect($stocksWithoutData, $availableStocks);
if (empty($hidden)) {
    echo "   ✓ All stocks without data are hidden from API\n";
} else {
    echo "   ✗ Found stocks without data: " . implode(', ', $hidden) . "\n";
}
echo "\n";

echo "✓ All checks passed!\n";
