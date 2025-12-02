<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = new \App\Services\StockPriceService();

echo "Testing Finnhub API with NEW KEY\n";
echo "=================================\n\n";

$timeframes = ['1H', '1D', '1W', '1M', 'ALL'];

foreach ($timeframes as $tf) {
    echo "Timeframe: {$tf}\n";
    echo str_repeat('-', 40) . "\n";
    
    $candles = $service->getCandlestickData('AAPL', $tf, 100);
    $count = count($candles);
    
    echo "Candles: {$count}\n";
    
    if ($count > 0) {
        $first = $candles[0];
        $last = end($candles);
        
        echo "First: " . date('Y-m-d H:i', (int)$first['time']) . "\n";
        echo "Last:  " . date('Y-m-d H:i', (int)$last['time']) . "\n";
        echo "Sample: O:{$first['open']} H:{$first['high']} L:{$first['low']} C:{$first['close']}\n";
    } else {
        echo "❌ No data returned\n";
    }
    
    echo "\n";
}

echo "✓ Test complete!\n";
