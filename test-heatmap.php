<?php

echo "Testing Heatmap API\n";
echo "===================\n\n";

// Test heatmap API
echo "GET /api/heatmap\n";
$ch = curl_init('http://localhost:8000/api/heatmap');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Total stocks: {$data['meta']['total_stocks']}\n\n";
    
    if ($data['meta']['total_stocks'] > 0) {
        echo "Stocks in heatmap:\n";
        foreach ($data['data'] as $stock) {
            $changeColor = $stock['change'] >= 0 ? '+' : '';
            echo sprintf(
                "  %-6s %-20s %s%6.2f%% \$%-8.2f Vol: %s\n",
                $stock['symbol'],
                substr($stock['name'], 0, 20),
                $changeColor,
                $stock['change'],
                $stock['price'],
                number_format($stock['volume'])
            );
        }
        
        echo "\nStatistics:\n";
        $gainers = array_filter($data['data'], fn($s) => $s['change'] > 0);
        $losers = array_filter($data['data'], fn($s) => $s['change'] < 0);
        $unchanged = array_filter($data['data'], fn($s) => $s['change'] == 0);
        
        echo "  Gainers: " . count($gainers) . "\n";
        echo "  Losers: " . count($losers) . "\n";
        echo "  Unchanged: " . count($unchanged) . "\n";
    }
} else {
    echo "Error: $response\n";
}

echo "\n✓ Test complete!\n";
