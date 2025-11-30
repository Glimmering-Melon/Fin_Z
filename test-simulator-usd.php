<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\SimulatorService;

echo "Testing Simulator with USD\n";
echo "==========================\n\n";

$simulator = new SimulatorService();

// Test 1: Small investment ($100)
echo "1. Testing $100 investment in AAPL\n";
try {
    $result = $simulator->simulate(
        amount: 100,
        symbol: 'AAPL',
        startDate: '2025-01-01',
        endDate: '2025-11-28'
    );
    
    echo "✓ Success!\n";
    echo "  Shares: {$result['shares']['quantity']}\n";
    echo "  Start Price: \${$result['prices']['start_price']}\n";
    echo "  End Price: \${$result['prices']['current_price']}\n";
    echo "  Profit/Loss: \${$result['returns']['profit_loss']}\n";
    echo "  Return: {$result['returns']['profit_loss_percentage']}%\n";
} catch (\Exception $e) {
    echo "✗ Error: {$e->getMessage()}\n";
}
echo "\n";

// Test 2: Larger investment ($10,000)
echo "2. Testing $10,000 investment in MSFT\n";
try {
    $result = $simulator->simulate(
        amount: 10000,
        symbol: 'MSFT',
        startDate: '2025-01-01',
        endDate: '2025-11-28'
    );
    
    echo "✓ Success!\n";
    echo "  Shares: {$result['shares']['quantity']}\n";
    echo "  Start Price: \${$result['prices']['start_price']}\n";
    echo "  End Price: \${$result['prices']['current_price']}\n";
    echo "  Profit/Loss: \${$result['returns']['profit_loss']}\n";
    echo "  Return: {$result['returns']['profit_loss_percentage']}%\n";
} catch (\Exception $e) {
    echo "✗ Error: {$e->getMessage()}\n";
}
echo "\n";

// Test 3: Too small investment ($1)
echo "3. Testing $1 investment (should fail)\n";
try {
    $result = $simulator->simulate(
        amount: 1,
        symbol: 'AAPL',
        startDate: '2025-01-01',
        endDate: '2025-11-28'
    );
    echo "✗ Should have failed but didn't!\n";
} catch (\Exception $e) {
    echo "✓ Correctly rejected: {$e->getMessage()}\n";
}
echo "\n";

echo "✓ All tests complete!\n";
