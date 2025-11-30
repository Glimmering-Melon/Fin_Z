<?php

echo "Testing Anomaly Detection API\n";
echo "==============================\n\n";

// Test anomaly API
echo "GET /api/anomalies\n";
$ch = curl_init('http://localhost:8000/api/anomalies');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Anomalies found: {$data['count']}\n\n";
    
    if ($data['count'] > 0) {
        echo "Detected anomalies:\n";
        foreach ($data['anomalies'] as $i => $anomaly) {
            echo "\n" . ($i + 1) . ". {$anomaly['symbol']} - " . strtoupper($anomaly['type']) . " Anomaly\n";
            echo "   Message: {$anomaly['message']}\n";
            echo "   Z-Score: {$anomaly['z_score']}\n";
            echo "   Value: {$anomaly['value']}\n";
            echo "   Mean: {$anomaly['mean']}\n";
            echo "   Std Dev: {$anomaly['std_dev']}\n";
        }
    } else {
        echo "✓ No anomalies detected (stocks trading normally)\n";
    }
} else {
    echo "Error: $response\n";
}

echo "\n✓ Test complete!\n";
