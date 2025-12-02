<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = new \App\Services\StockPriceService();

echo "Testing FINNHUB với độ chia hợp lý\n";
echo "===================================\n\n";

$timeframes = [
    '1H' => '1 minute (độ chia nhỏ nhất)',
    '1D' => '5 minutes (độ chia nhỏ)',
    '1W' => '15 minutes (độ chia vừa)',
    '1M' => '60 minutes (độ chia lớn)',
    'ALL' => 'Daily (độ chia lớn nhất)'
];

foreach ($timeframes as $tf => $desc) {
    echo "📊 Timeframe: {$tf} - {$desc}\n";
    echo str_repeat('-', 50) . "\n";
    
    $candles = $service->getCandlestickData('AAPL', $tf, 100);
    $count = count($candles);
    
    echo "   Candles: {$count}\n";
    
    if ($count > 0) {
        $first = $candles[0];
        $last = end($candles);
        
        echo "   First: " . date('Y-m-d H:i', (int)$first['time']) . "\n";
        echo "   Last:  " . date('Y-m-d H:i', (int)$last['time']) . "\n";
        
        if ($count > 1) {
            $diff = $candles[1]['time'] - $candles[0]['time'];
            $minutes = $diff / 60;
            
            echo "   Interval: ";
            if ($minutes < 60) {
                echo round($minutes) . " phút\n";
            } elseif ($minutes < 1440) {
                echo round($minutes / 60, 1) . " giờ\n";
            } else {
                echo round($minutes / 1440) . " ngày\n";
            }
        }
        
        echo "   Sample: O:{$first['open']} H:{$first['high']} L:{$first['low']} C:{$first['close']}\n";
    } else {
        echo "   ❌ No data\n";
    }
    
    echo "\n";
}

echo "✅ Độ chia hợp lý: Timeframe nhỏ → Resolution nhỏ!\n";
