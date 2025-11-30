<?php

// Test Finnhub API directly
$apiKey = 'd4ks0e9r01qt7v16shdgd4ks0e9r01qt7v16she0';
$symbol = 'AAPL';

// Test 1: Quote
echo "Testing Finnhub Quote API...\n";
$url = "https://finnhub.io/api/v1/quote?symbol={$symbol}&token={$apiKey}";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n";
echo "Response: {$response}\n\n";

// Test 2: Candles
echo "Testing Finnhub Candles API...\n";
$to = time();
$from = $to - (7 * 24 * 60 * 60); // 7 days ago
$url = "https://finnhub.io/api/v1/stock/candle?symbol={$symbol}&resolution=D&from={$from}&to={$to}&token={$apiKey}";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n";
echo "Response: {$response}\n";
