<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing NewsController\n";
echo "======================\n\n";

// Simulate the controller logic
$userId = 1;
$watchlistStocks = \App\Models\Watchlist::where('user_id', $userId)
    ->with('stock')
    ->get();

echo "Watchlist stocks: " . $watchlistStocks->count() . "\n\n";

$allNews = collect();
$finnhubApiKey = env('FINNHUB_API_KEY');
$from = date('Y-m-d', strtotime('-7 days'));
$to = date('Y-m-d');

echo "Fetching news from $from to $to\n\n";

// Test with first 2 stocks
foreach ($watchlistStocks->take(2) as $watchlistItem) {
    $symbol = $watchlistItem->stock->symbol;
    echo "Fetching news for {$symbol}...\n";
    
    $url = "https://finnhub.io/api/v1/company-news?symbol={$symbol}&from={$from}&to={$to}&token={$finnhubApiKey}";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $newsData = json_decode($response, true);
        echo "  Got " . count($newsData) . " articles\n";
        
        foreach (array_slice($newsData, 0, 5) as $item) {
            $allNews->push([
                'title' => $item['headline'] ?? '',
                'symbol' => $symbol,
                'published_at' => isset($item['datetime']) ? date('Y-m-d H:i:s', $item['datetime']) : now(),
            ]);
        }
    } else {
        echo "  Error: HTTP $httpCode\n";
    }
}

echo "\nTotal news collected: " . $allNews->count() . "\n";

if ($allNews->count() > 0) {
    echo "\nSample news:\n";
    foreach ($allNews->take(3) as $news) {
        echo "  [{$news['symbol']}] {$news['title']}\n";
    }
}

echo "\n✓ Test complete!\n";
