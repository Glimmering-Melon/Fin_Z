<?php

echo "Testing News Page\n";
echo "=================\n\n";

// Test 1: Check if news page loads
echo "1. Testing news page route\n";
$ch = curl_init('http://localhost:8000/news');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    echo "✓ News page loads successfully\n";
    
    // Check if page contains news data
    if (strpos($response, 'Market News') !== false) {
        echo "✓ Page contains news content\n";
    } else {
        echo "✗ Page missing news content\n";
    }
} else {
    echo "✗ News page failed to load\n";
}

echo "\n✓ Test complete!\n";
echo "\nTo view the news page, visit: http://localhost:8000/news\n";
