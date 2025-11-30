<?php

echo "Testing Watchlist API\n";
echo "=====================\n\n";

// Test 1: GET /api/user/watchlist
echo "1. GET /api/user/watchlist\n";
$ch = curl_init('http://localhost:8000/api/user/watchlist');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Response: " . count($data) . " items\n";
    if (count($data) > 0) {
        echo "First item: " . $data[0]['symbol'] . " - " . $data[0]['name'] . "\n";
    }
} else {
    echo "Error: $response\n";
}
echo "\n";

// Test 2: POST /api/user/watchlist (add AMZN)
echo "2. POST /api/user/watchlist (add AMZN)\n";
$ch = curl_init('http://localhost:8000/api/user/watchlist');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['symbol' => 'AMZN']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
echo "Response: $response\n";
echo "\n";

// Test 3: GET /api/stocks
echo "3. GET /api/stocks\n";
$ch = curl_init('http://localhost:8000/api/stocks');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Response: " . $data['count'] . " stocks available\n";
    if ($data['count'] > 0) {
        echo "First 3 stocks:\n";
        for ($i = 0; $i < min(3, count($data['data'])); $i++) {
            echo "  - " . $data['data'][$i]['symbol'] . ": " . $data['data'][$i]['name'] . "\n";
        }
    }
}
echo "\n";

echo "✓ API test complete!\n";
