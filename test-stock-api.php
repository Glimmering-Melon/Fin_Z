<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\StockDataService;

$service = app(StockDataService::class);

echo "Testing StockDataService...\n";
echo "Fetching AAPL data for 90 days...\n\n";

try {
    $data = $service->getHistoricalData('AAPL', 90);
    
    if ($data) {
        echo "Success! Got data:\n";
        echo "Timestamps count: " . count($data['timestamps']) . "\n";
        echo "First date: " . $data['timestamps'][0] . "\n";
        echo "Last date: " . end($data['timestamps']) . "\n";
        echo "First close price: $" . $data['close'][0] . "\n";
        echo "Last close price: $" . end($data['close']) . "\n";
    } else {
        echo "No data returned\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
