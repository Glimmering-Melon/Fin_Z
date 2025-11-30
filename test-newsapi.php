<?php

require __DIR__.'/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "Testing NewsAPI\n";
echo "===============\n\n";

$apiKey = $_ENV['NEWS_API_KEY'];
$baseUrl = $_ENV['NEWS_API_BASE_URL'] ?? 'https://newsapi.org';

echo "API Key: " . substr($apiKey, 0, 10) . "...\n";
echo "Base URL: $baseUrl\n\n";

// Test 1: Get top business headlines
echo "1. Testing top business headlines\n";
$url = "{$baseUrl}/v2/top-headlines?apiKey={$apiKey}&category=business&language=en&pageSize=10";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: StockDashboard/1.0',
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if ($data['status'] === 'ok') {
        echo "✓ Success! Total results: {$data['totalResults']}\n";
        echo "Articles returned: " . count($data['articles']) . "\n\n";
        
        echo "Sample articles:\n";
        foreach (array_slice($data['articles'], 0, 3) as $i => $article) {
            echo "\n" . ($i + 1) . ". {$article['title']}\n";
            echo "   Source: {$article['source']['name']}\n";
            echo "   Published: {$article['publishedAt']}\n";
            echo "   URL: {$article['url']}\n";
        }
    } else {
        echo "✗ API returned error: {$data['message']}\n";
    }
} else {
    echo "✗ HTTP Error: $httpCode\n";
    echo "Response: $response\n";
}

echo "\n✓ Test complete!\n";
