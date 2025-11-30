<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Watchlist;
use App\Models\Stock;

echo "Debugging News Fetch\n";
echo "====================\n\n";

// Test 1: Check watchlist
echo "1. Checking watchlist for user 1\n";
$watchlist = Watchlist::where('user_id', 1)->with('stock')->get();
echo "Watchlist items: " . $watchlist->count() . "\n";

if ($watchlist->isEmpty()) {
    echo "✗ Watchlist is empty!\n";
    exit;
}

foreach ($watchlist as $item) {
    echo "  - {$item->stock->symbol}: {$item->stock->name}\n";
}
echo "\n";

// Test 2: Test Finnhub company news API
echo "2. Testing Finnhub company news API\n";
$apiKey = env('FINNHUB_API_KEY');
$symbol = $watchlist->first()->stock->symbol;

echo "Testing with symbol: $symbol\n";
echo "API Key: " . substr($apiKey, 0, 10) . "...\n\n";

$from = date('Y-m-d', strtotime('-7 days'));
$to = date('Y-m-d');

echo "Date range: $from to $to\n\n";

$url = "https://finnhub.io/api/v1/company-news?symbol={$symbol}&from={$from}&to={$to}&token={$apiKey}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "News articles returned: " . count($data) . "\n\n";
    
    if (count($data) > 0) {
        echo "Sample article:\n";
        $article = $data[0];
        echo "  Title: {$article['headline']}\n";
        echo "  Source: {$article['source']}\n";
        echo "  URL: {$article['url']}\n";
        echo "  Date: " . date('Y-m-d H:i:s', $article['datetime']) . "\n";
    } else {
        echo "✗ No news articles found for $symbol\n";
        echo "This might be normal if there's no recent news.\n";
    }
} else {
    echo "✗ API Error: $httpCode\n";
    echo "Response: $response\n";
}

echo "\n✓ Debug complete!\n";
