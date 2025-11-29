<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "API URL: " . env('STOCK_API_URL') . "\n";
echo "API KEY: " . env('STOCK_API_KEY') . "\n";
