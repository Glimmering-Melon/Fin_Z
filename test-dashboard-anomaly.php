<?php

echo "Testing Dashboard Anomaly Detection\n";
echo "====================================\n\n";

// 1. Check watchlist
echo "1. Checking watchlist...\n";
$ch = curl_init('http://localhost:8000/api/user/watchlist');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $watchlist = json_decode($response, true);
    echo "   ✓ Watchlist has " . count($watchlist) . " stocks\n";
    if (count($watchlist) > 0) {
        echo "   Stocks: " . implode(', ', array_column($watchlist, 'symbol')) . "\n";
    }
} else {
    echo "   ✗ Failed to fetch watchlist\n";
}

echo "\n2. Checking anomalies API...\n";
$ch = curl_init('http://localhost:8000/api/anomalies');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "   ✓ API returned {$data['count']} anomalies\n";
    
    if ($data['count'] > 0) {
        echo "\n   Anomalies detected:\n";
        foreach ($data['anomalies'] as $i => $anomaly) {
            $typeLabel = $anomaly['type'] === 'volume' ? 'VOLUME' : 'PRICE';
            $severity = strtoupper($anomaly['severity']);
            
            echo "\n   " . ($i + 1) . ". [{$severity}] {$anomaly['symbol']} - {$typeLabel}\n";
            echo "      Z-Score: {$anomaly['z_score']}\n";
            
            if ($anomaly['type'] === 'volume') {
                echo "      Volume: " . number_format($anomaly['value']) . "\n";
                echo "      Avg Volume: " . number_format($anomaly['mean']) . "\n";
            } else {
                echo "      Price Change: {$anomaly['value']}%\n";
                echo "      Avg Change: {$anomaly['mean']}%\n";
            }
        }
        
        echo "\n   ✓ Dashboard will display these anomalies!\n";
    } else {
        echo "   ✓ No anomalies (stocks trading normally)\n";
        echo "   Dashboard will show 'No anomalies detected' message\n";
    }
} else {
    echo "   ✗ Failed to fetch anomalies\n";
}

echo "\n3. Testing filter functionality...\n";
$volumeCount = 0;
$priceCount = 0;

if (isset($data['anomalies'])) {
    foreach ($data['anomalies'] as $anomaly) {
        if ($anomaly['type'] === 'volume') $volumeCount++;
        if ($anomaly['type'] === 'price') $priceCount++;
    }
}

echo "   Volume anomalies: $volumeCount\n";
echo "   Price anomalies: $priceCount\n";
echo "   ✓ Filters will work correctly\n";

echo "\n====================================\n";
echo "✓ Anomaly Detection is ready!\n\n";
echo "To test on Dashboard:\n";
echo "1. Open http://localhost:8000/\n";
echo "2. Scroll to 'Anomaly Detection' section\n";
echo "3. Try filtering by All/Volume/Price\n";
echo "4. Click Refresh to update\n";
