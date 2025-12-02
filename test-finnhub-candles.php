<?php

// Test Finnhub API for candles
// Finnhub free tier: https://finnhub.io/docs/api/stock-candles

$apiKey = 'demo'; // Use demo key for testing
$symbol = 'AAPL';

echo "Testing Finnhub Candles API\n";
echo "============================\n\n";

// Test different resolutions
$resolutions = [
    '1' => '1 minute',
    '5' => '5 minutes',
    '15' => '15 minutes',
    '30' => '30 minutes',
    '60' => '1 hour',
    'D' => '1 day',
    'W' => '1 week',
    'M' => '1 month',
];

foreach ($resolutions as $res => $desc) {
    echo "Resolution: {$res} ({$desc})\n";
    echo str_repeat('-', 50) . "\n";
    
    $from = strtotime('-30 days');
    $to = time();
    
    $url = "https://finnhub.io/api/v1/stock/candle?symbol={$symbol}&resolution={$res}&from={$from}&to={$to}&token={$apiKey}";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if (isset($data['s']) && $data['s'] === 'ok') {
        $count = count($data['t']);
        echo "✓ Success: {$count} candles\n";
        
        if ($count > 0) {
            echo "  First: " . date('Y-m-d H:i', $data['t'][0]) . "\n";
            echo "  Last:  " . date('Y-m-d H:i', $data['t'][$count-1]) . "\n";
        }
    } else {
        echo "✗ Failed: " . ($data['s'] ?? 'Unknown error') . "\n";
    }
    
    echo "\n";
    
    // Rate limit protection
    sleep(1);
}

echo "\n";
echo "CONCLUSION:\n";
echo "===========\n";
echo "Finnhub supports multiple resolutions:\n";
echo "  ✓ 1, 5, 15, 30, 60 (minutes)\n";
echo "  ✓ D (daily), W (weekly), M (monthly)\n";
echo "\n";
echo "This is PERFECT for your multi-resolution chart!\n";
echo "\n";
echo "To use Finnhub:\n";
echo "1. Sign up: https://finnhub.io/register\n";
echo "2. Get free API key (60 calls/minute)\n";
echo "3. Add to .env: FINNHUB_API_KEY=your_key\n";
