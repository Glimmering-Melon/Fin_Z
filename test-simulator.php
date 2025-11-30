<?php

echo "Testing Simulator API\n";
echo "=====================\n\n";

// Test 1: Simulate AAPL investment
echo "1. POST /api/simulator/simulate (AAPL)\n";
$data = [
    'symbol' => 'AAPL',
    'amount' => 10000,
    'start_date' => '2024-01-01',
    'end_date' => '2024-11-30',
];

$ch = curl_init('http://localhost:8000/api/simulator/simulate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    $result = json_decode($response, true);
    echo "Symbol: " . $result['symbol'] . "\n";
    echo "Initial Investment: $" . number_format($result['initialInvestment'], 2) . "\n";
    echo "Final Value: $" . number_format($result['finalValue'], 2) . "\n";
    echo "Profit: $" . number_format($result['profit'], 2) . "\n";
    echo "Profit %: " . number_format($result['profitPercent'], 2) . "%\n";
    echo "Period: {$result['startDate']} to {$result['endDate']}\n";
} else {
    echo "Error: $response\n";
}
echo "\n";

// Test 2: Get watchlist
echo "2. GET /api/user/watchlist\n";
$ch = curl_init('http://localhost:8000/api/user/watchlist');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Watchlist has " . count($data) . " stocks:\n";
    foreach (array_slice($data, 0, 5) as $stock) {
        echo "  - {$stock['symbol']}: {$stock['name']}\n";
    }
}
echo "\n";

echo "✓ Test complete!\n";
