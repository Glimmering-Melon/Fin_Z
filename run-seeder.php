<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Starting seeder...\n";

$seeder = new Database\Seeders\StockSeeder();
$seeder->run();

echo "Seeder completed!\n";
