<?php

// Test Alpha Vantage API directly
$apiKey = '4XB1PQNPOBEZ6D9S';
$symbol = 'AAPL';

echo "Testing Alpha Vantage Daily API...\n";
$url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={$symbol}&apikey={$apiKey}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: {$httpCode}\n";
echo "Response: " . substr($response, 0, 500) . "...\n\n";

// Parse and show structure
$data = json_decode($response, true);
if (isset($data['Time Series (Daily)'])) {
    $dates = array_keys($data['Time Series (Daily)']);
    echo "Found " . count($dates) . " days of data\n";
    echo "Latest date: " . $dates[0] . "\n";
    echo "Sample data: " . json_encode($data['Time Series (Daily)'][$dates[0]]) . "\n";
} else {
    echo "Error or no data\n";
    if (isset($data['Note'])) {
        echo "Note: " . $data['Note'] . "\n";
    }
    if (isset($data['Error Message'])) {
        echo "Error: " . $data['Error Message'] . "\n";
    }
}
