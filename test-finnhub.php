<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\FinnhubService;

echo "Testing Finnhub API...\n\n";

$finnhub = app(FinnhubService::class);

// Test 1: Get quote for AAPL
echo "1. Getting quote for AAPL...\n";
$quote = $finnhub->getQuote('AAPL');
if ($quote) {
    echo "✅ Success!\n";
    echo "   Current Price: $" . $quote['current'] . "\n";
    echo "   Change: " . ($quote['change'] >= 0 ? '+' : '') . $quote['change'] . " (" . $quote['changePercent'] . "%)\n";
    echo "   High: $" . $quote['high'] . "\n";
    echo "   Low: $" . $quote['low'] . "\n\n";
} else {
    echo "❌ Failed to fetch quote\n\n";
}

// Test 2: Search symbols
echo "2. Searching for 'apple'...\n";
$results = $finnhub->searchSymbol('apple');
if (!empty($results)) {
    echo "✅ Found " . count($results) . " results:\n";
    foreach (array_slice($results, 0, 5) as $result) {
        echo "   - {$result['symbol']}: {$result['description']}\n";
    }
    echo "\n";
} else {
    echo "❌ No results found\n\n";
}

// Test 3: Get market news
echo "3. Getting market news...\n";
$news = $finnhub->getMarketNews('general');
if (!empty($news)) {
    echo "✅ Found " . count($news) . " news articles:\n";
    foreach (array_slice($news, 0, 3) as $article) {
        echo "   - " . ($article['headline'] ?? 'No title') . "\n";
        echo "     Source: " . ($article['source'] ?? 'Unknown') . "\n";
    }
    echo "\n";
} else {
    echo "❌ No news found\n\n";
}

// Test 4: Get company profile
echo "4. Getting company profile for AAPL...\n";
$profile = $finnhub->getCompanyProfile('AAPL');
if ($profile) {
    echo "✅ Success!\n";
    echo "   Name: " . ($profile['name'] ?? 'N/A') . "\n";
    echo "   Country: " . ($profile['country'] ?? 'N/A') . "\n";
    echo "   Industry: " . ($profile['finnhubIndustry'] ?? 'N/A') . "\n";
    echo "   Market Cap: $" . number_format($profile['marketCapitalization'] ?? 0) . "M\n\n";
} else {
    echo "❌ Failed to fetch profile\n\n";
}

// Test 5: Get multiple quotes
echo "5. Getting multiple quotes (AAPL, MSFT, GOOGL)...\n";
$quotes = $finnhub->getMultipleQuotes(['AAPL', 'MSFT', 'GOOGL']);
if (!empty($quotes)) {
    echo "✅ Success!\n";
    foreach ($quotes as $symbol => $data) {
        echo "   {$symbol}: $" . $data['current'] . " (" . ($data['change'] >= 0 ? '+' : '') . $data['changePercent'] . "%)\n";
    }
    echo "\n";
} else {
    echo "❌ Failed to fetch quotes\n\n";
}

echo "✅ All tests completed!\n\n";
echo "API Endpoints available:\n";
echo "- GET  /api/finnhub/quote/{symbol}\n";
echo "- GET  /api/finnhub/profile/{symbol}\n";
echo "- GET  /api/finnhub/news/company/{symbol}\n";
echo "- GET  /api/finnhub/news/market\n";
echo "- GET  /api/finnhub/search?q=apple\n";
echo "- GET  /api/finnhub/candles/{symbol}?resolution=D\n";
echo "- POST /api/finnhub/quotes/multiple (body: {\"symbols\": [\"AAPL\", \"MSFT\"]})\n";
echo "- GET  /api/finnhub/recommendations/{symbol}\n";
