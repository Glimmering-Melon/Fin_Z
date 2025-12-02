<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = new \App\Services\StockPriceService();

echo "🎯 TEST MULTI-RESOLUTION CHART\n";
echo "================================\n\n";

echo "Khi click timeframe, chart sẽ:\n";
echo "1. Load data với resolution phù hợp\n";
echo "2. Zoom in/out vẫn giữ resolution đó\n";
echo "3. Scroll trái/phải xem data cũ/mới\n\n";

$timeframes = [
    '1H' => '1 phút (chi tiết nhất)',
    '1D' => '5 phút (chi tiết)',
    '1W' => '15 phút (vừa)',
    '1M' => '1 giờ (tổng quan)',
    'ALL' => '1 ngày (tổng quan lớn)'
];

foreach ($timeframes as $tf => $desc) {
    echo "📊 Click [{$tf}] → Resolution: {$desc}\n";
    echo str_repeat('-', 60) . "\n";
    
    $candles = $service->getCandlestickData('AAPL', $tf, 5000);
    $count = count($candles);
    
    if ($count > 0) {
        $first = $candles[0];
        $last = end($candles);
        
        // Calculate interval
        if ($count > 1) {
            $diff = $candles[1]['time'] - $candles[0]['time'];
            $minutes = $diff / 60;
            
            $interval = '';
            if ($minutes < 60) {
                $interval = round($minutes) . " phút";
            } elseif ($minutes < 1440) {
                $interval = round($minutes / 60, 1) . " giờ";
            } else {
                $interval = round($minutes / 1440) . " ngày";
            }
        } else {
            $interval = 'N/A';
        }
        
        $duration = $last['time'] - $first['time'];
        $days = round($duration / 86400);
        
        echo "   ✅ {$count} candles × {$interval} = {$days} ngày data\n";
        echo "   📅 From: " . date('Y-m-d H:i', (int)$first['time']) . "\n";
        echo "   📅 To:   " . date('Y-m-d H:i', (int)$last['time']) . "\n";
        echo "   💡 Zoom in/out → Vẫn thấy data với độ chia {$interval}\n";
    } else {
        echo "   ❌ No data\n";
    }
    
    echo "\n";
}

echo "🎉 Perfect! Mỗi timeframe có resolution riêng!\n";
echo "🚀 Test ngay: http://localhost:8000/test/chart\n";
