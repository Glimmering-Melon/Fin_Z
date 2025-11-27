<?php

/**
 * SimulatorService Usage Examples
 * 
 * This file demonstrates how to use the SimulatorService
 * Run: php artisan tinker
 * Then copy-paste these examples
 */

use App\Services\SimulatorService;
use App\Models\Stock;
use App\Models\StockPrice;

// ============================================
// Example 1: Simple Investment Simulation
// ============================================

$simulator = app(SimulatorService::class);

$result = $simulator->simulate(
    amount: 10000000,        // 10 million VND
    symbol: 'VNM',
    startDate: '2024-01-01'
);

echo "=== INVESTMENT SIMULATION ===\n";
echo "Stock: {$result['stock']['symbol']} - {$result['stock']['name']}\n";
echo "Investment: " . number_format($result['investment']['actual_amount']) . " VND\n";
echo "Shares: {$result['shares']['quantity']} ({$result['shares']['lots']} lots)\n";
echo "Start Price: " . number_format($result['prices']['start_price']) . " VND\n";
echo "Current Price: " . number_format($result['prices']['current_price']) . " VND\n";
echo "Current Value: " . number_format($result['returns']['current_value']) . " VND\n";
echo "Profit/Loss: " . number_format($result['returns']['profit_loss']) . " VND\n";
echo "Return: " . round($result['returns']['profit_loss_percentage'], 2) . "%\n";
echo "Annualized Return: " . round($result['returns']['annualized_return'], 2) . "%\n";
echo "Days Held: {$result['investment']['days_held']} days\n\n";

// ============================================
// Example 2: Compare Multiple Stocks
// ============================================

$comparison = $simulator->compareMultiple(
    amount: 10000000,
    symbols: ['VNM', 'VCB', 'HPG'],
    startDate: '2024-01-01'
);

echo "=== STOCK COMPARISON ===\n";
echo "Total Investment: " . number_format($comparison['summary']['total_investment']) . " VND\n";
echo "Total Current Value: " . number_format($comparison['summary']['total_current_value']) . " VND\n";
echo "Total P/L: " . number_format($comparison['summary']['total_profit_loss']) . " VND\n";
echo "Total Return: " . round($comparison['summary']['total_profit_loss_percentage'], 2) . "%\n";
echo "Average Return: " . round($comparison['summary']['average_return_percentage'], 2) . "%\n\n";

if ($comparison['summary']['best_performer']) {
    echo "🏆 Best Performer: {$comparison['summary']['best_performer']['symbol']} ";
    echo "(+" . round($comparison['summary']['best_performer']['return_percentage'], 2) . "%)\n";
}

if ($comparison['summary']['worst_performer']) {
    echo "📉 Worst Performer: {$comparison['summary']['worst_performer']['symbol']} ";
    echo "(" . round($comparison['summary']['worst_performer']['return_percentage'], 2) . "%)\n\n";
}

echo "Individual Results:\n";
foreach ($comparison['comparison'] as $stock) {
    $symbol = $stock['stock']['symbol'];
    $pl = $stock['returns']['profit_loss'];
    $plPercent = $stock['returns']['profit_loss_percentage'];
    
    $emoji = $pl >= 0 ? '📈' : '📉';
    $sign = $pl >= 0 ? '+' : '';
    
    echo "{$emoji} {$symbol}: {$sign}" . number_format($pl) . " VND ";
    echo "({$sign}" . round($plPercent, 2) . "%)\n";
}

if (!empty($comparison['errors'])) {
    echo "\nErrors:\n";
    foreach ($comparison['errors'] as $error) {
        echo "❌ {$error['symbol']}: {$error['error']}\n";
    }
}

// ============================================
// Example 3: Historical Performance for Chart
// ============================================

$performance = $simulator->getHistoricalPerformance(
    symbol: 'VNM',
    startDate: '2024-01-01',
    shares: 100
);

echo "\n=== HISTORICAL PERFORMANCE (First 5 days) ===\n";
foreach (array_slice($performance, 0, 5) as $day) {
    echo "Date: {$day['date']} | ";
    echo "Price: " . number_format($day['price']) . " | ";
    echo "Value: " . number_format($day['value']) . " | ";
    echo "P/L: " . number_format($day['profit_loss']) . " | ";
    echo "Return: " . round($day['profit_loss_percentage'], 2) . "%\n";
}

// ============================================
// Example 4: Error Handling
// ============================================

try {
    // Invalid symbol
    $simulator->simulate(
        amount: 10000000,
        symbol: 'INVALID',
        startDate: '2024-01-01'
    );
} catch (\Exception $e) {
    echo "\n❌ Error: {$e->getMessage()}\n";
}

try {
    // Amount too small
    $simulator->simulate(
        amount: 1000,
        symbol: 'VNM',
        startDate: '2024-01-01'
    );
} catch (\Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

try {
    // Future date
    $simulator->simulate(
        amount: 10000000,
        symbol: 'VNM',
        startDate: '2025-12-31'
    );
} catch (\Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

// ============================================
// Example 5: Calculate ROI for Different Timeframes
// ============================================

echo "\n=== ROI COMPARISON - DIFFERENT TIMEFRAMES ===\n";

$timeframes = [
    '1 Month' => '2024-03-01',
    '3 Months' => '2024-01-01',
    '6 Months' => '2023-10-01',
    '1 Year' => '2023-04-01',
];

foreach ($timeframes as $label => $startDate) {
    try {
        $result = $simulator->simulate(
            amount: 10000000,
            symbol: 'VNM',
            startDate: $startDate
        );
        
        $return = $result['returns']['profit_loss_percentage'];
        $annualized = $result['returns']['annualized_return'];
        $emoji = $return >= 0 ? '📈' : '📉';
        
        echo "{$emoji} {$label}: " . round($return, 2) . "% ";
        echo "(Annualized: " . round($annualized, 2) . "%)\n";
        
    } catch (\Exception $e) {
        echo "❌ {$label}: {$e->getMessage()}\n";
    }
}

// ============================================
// Example 6: Portfolio Diversification Analysis
// ============================================

echo "\n=== PORTFOLIO DIVERSIFICATION ===\n";

$sectors = [
    'Banking' => ['VCB', 'TCB', 'MBB'],
    'Consumer Goods' => ['VNM', 'MSN', 'SAB'],
    'Real Estate' => ['VHM', 'NVL', 'VIC'],
];

$portfolioAmount = 30000000; // 30 million VND
$amountPerStock = $portfolioAmount / 3;

foreach ($sectors as $sector => $symbols) {
    echo "\n{$sector} Sector:\n";
    
    try {
        $result = $simulator->compareMultiple(
            amount: $amountPerStock,
            symbols: array_slice($symbols, 0, 3),
            startDate: '2024-01-01'
        );
        
        echo "  Average Return: " . round($result['summary']['average_return_percentage'], 2) . "%\n";
        echo "  Best: {$result['summary']['best_performer']['symbol']} ";
        echo "(+" . round($result['summary']['best_performer']['return_percentage'], 2) . "%)\n";
        
    } catch (\Exception $e) {
        echo "  Error: {$e->getMessage()}\n";
    }
}

// ============================================
// Example 7: Dollar Cost Averaging Simulation
// ============================================

echo "\n=== DOLLAR COST AVERAGING ===\n";
echo "Monthly investment: 5,000,000 VND\n";
echo "Period: 6 months\n\n";

$monthlyInvestment = 5000000;
$months = [
    '2024-01-01',
    '2024-02-01',
    '2024-03-01',
    '2024-04-01',
    '2024-05-01',
    '2024-06-01',
];

$totalInvested = 0;
$totalShares = 0;

foreach ($months as $month) {
    try {
        $result = $simulator->simulate(
            amount: $monthlyInvestment,
            symbol: 'VNM',
            startDate: $month
        );
        
        $shares = $result['shares']['quantity'];
        $price = $result['prices']['start_price'];
        
        $totalInvested += $result['investment']['actual_amount'];
        $totalShares += $shares;
        
        echo "Month {$month}: {$shares} shares @ " . number_format($price) . " VND\n";
        
    } catch (\Exception $e) {
        echo "Month {$month}: Error - {$e->getMessage()}\n";
    }
}

echo "\nTotal Invested: " . number_format($totalInvested) . " VND\n";
echo "Total Shares: {$totalShares}\n";
echo "Average Price: " . number_format($totalInvested / $totalShares) . " VND/share\n";

// ============================================
// Example 8: What-If Analysis
// ============================================

echo "\n=== WHAT-IF ANALYSIS ===\n";
echo "What if you invested different amounts in VNM on 2024-01-01?\n\n";

$amounts = [5000000, 10000000, 20000000, 50000000, 100000000];

foreach ($amounts as $amount) {
    try {
        $result = $simulator->simulate(
            amount: $amount,
            symbol: 'VNM',
            startDate: '2024-01-01'
        );
        
        $invested = $result['investment']['actual_amount'];
        $currentValue = $result['returns']['current_value'];
        $profit = $result['returns']['profit_loss'];
        
        echo number_format($amount) . " VND → ";
        echo number_format($currentValue) . " VND ";
        echo "(P/L: " . number_format($profit) . " VND)\n";
        
    } catch (\Exception $e) {
        echo number_format($amount) . " VND → Error: {$e->getMessage()}\n";
    }
}

echo "\n✅ All examples completed!\n";
