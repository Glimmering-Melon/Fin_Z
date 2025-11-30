<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockPrice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SimulatorService
{
    /**
     * Simulate investment for a single stock
     *
     * @param float $amount Investment amount in USD
     * @param string $symbol Stock symbol (e.g., 'AAPL', 'MSFT')
     * @param string $startDate Start date in Y-m-d format
     * @param string|null $endDate End date in Y-m-d format (optional, defaults to latest)
     * @return array Simulation results
     * @throws \Exception
     */
    public function simulate(float $amount, string $symbol, string $startDate, ?string $endDate = null): array
    {
        // Validate amount
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Investment amount must be greater than 0');
        }

        // Find stock
        $stock = Stock::where('symbol', strtoupper($symbol))->first();
        if (!$stock) {
            throw new \Exception("Stock symbol '{$symbol}' not found");
        }

        // Parse start date
        $startDate = Carbon::parse($startDate);
        $today = Carbon::today();

        // Validate date range
        if ($startDate->isFuture()) {
            throw new \InvalidArgumentException('Start date cannot be in the future');
        }

        // Get historical price at or after start date
        $startPrice = StockPrice::where('stock_id', $stock->id)
            ->where('date', '>=', $startDate)
            ->orderBy('date', 'asc')
            ->first();

        if (!$startPrice) {
            throw new \Exception("No price data available for {$symbol} from {$startDate->format('Y-m-d')}");
        }

        // Get end price (either specified end date or latest)
        if ($endDate) {
            $endDateParsed = Carbon::parse($endDate);
            $currentPrice = StockPrice::where('stock_id', $stock->id)
                ->where('date', '<=', $endDateParsed)
                ->orderBy('date', 'desc')
                ->first();
            
            if (!$currentPrice) {
                throw new \Exception("No price data available for {$symbol} up to {$endDateParsed->format('Y-m-d')}");
            }
        } else {
            $currentPrice = StockPrice::where('stock_id', $stock->id)
                ->orderBy('date', 'desc')
                ->first();

            if (!$currentPrice) {
                throw new \Exception("No current price data available for {$symbol}");
            }
        }

        // Calculate shares bought (US stocks - can buy fractional shares)
        $pricePerShare = (float) $startPrice->close;
        $sharesRaw = $amount / $pricePerShare;
        $shares = floor($sharesRaw * 100) / 100; // Round down to 2 decimal places

        if ($shares <= 0) {
            throw new \Exception("Investment amount too small. Minimum required: $" . number_format($pricePerShare, 2));
        }

        // Calculate actual investment (after rounding shares)
        $actualInvestment = $shares * $pricePerShare;

        // Calculate current value
        $currentPricePerShare = (float) $currentPrice->close;
        $currentValue = $shares * $currentPricePerShare;

        // Calculate profit/loss
        $profitLoss = $currentValue - $actualInvestment;
        $profitLossPercentage = ($actualInvestment > 0) 
            ? ($profitLoss / $actualInvestment) * 100 
            : 0;

        // Calculate number of days held
        $daysHeld = $startPrice->date->diffInDays($currentPrice->date);

        // Calculate annualized return
        $yearsHeld = $daysHeld / 365;
        $annualizedReturn = ($yearsHeld > 0 && $actualInvestment > 0)
            ? (pow(($currentValue / $actualInvestment), (1 / $yearsHeld)) - 1) * 100
            : 0;

        return [
            'stock' => [
                'symbol' => $stock->symbol,
                'name' => $stock->name,
                'exchange' => $stock->exchange,
                'sector' => $stock->sector,
            ],
            'investment' => [
                'requested_amount' => $amount,
                'actual_amount' => $actualInvestment,
                'start_date' => $startPrice->date->format('Y-m-d'),
                'end_date' => $currentPrice->date->format('Y-m-d'),
                'days_held' => $daysHeld,
            ],
            'prices' => [
                'start_price' => $pricePerShare,
                'current_price' => $currentPricePerShare,
                'price_change' => $currentPricePerShare - $pricePerShare,
                'price_change_percentage' => ($pricePerShare > 0) 
                    ? (($currentPricePerShare - $pricePerShare) / $pricePerShare) * 100 
                    : 0,
            ],
            'shares' => [
                'quantity' => $shares,
            ],
            'returns' => [
                'current_value' => $currentValue,
                'profit_loss' => $profitLoss,
                'profit_loss_percentage' => $profitLossPercentage,
                'annualized_return' => $annualizedReturn,
            ],
        ];
    }

    /**
     * Compare investment simulation for multiple stocks
     *
     * @param float $amount Investment amount per stock in USD
     * @param array $symbols Array of stock symbols
     * @param string $startDate Start date in Y-m-d format
     * @param string|null $endDate End date in Y-m-d format (optional)
     * @return array Comparison results
     */
    public function compareMultiple(float $amount, array $symbols, string $startDate, ?string $endDate = null): array
    {
        if (empty($symbols)) {
            throw new \InvalidArgumentException('At least one stock symbol is required');
        }

        if (count($symbols) > 5) {
            throw new \InvalidArgumentException('Maximum 5 stocks can be compared at once');
        }

        $results = [];
        $errors = [];

        foreach ($symbols as $symbol) {
            try {
                $results[] = $this->simulate($amount, $symbol, $startDate, $endDate);
            } catch (\Exception $e) {
                $errors[] = [
                    'symbol' => $symbol,
                    'error' => $e->getMessage(),
                ];
            }
        }

        // Sort by profit/loss percentage (descending)
        usort($results, function ($a, $b) {
            return $b['returns']['profit_loss_percentage'] <=> $a['returns']['profit_loss_percentage'];
        });

        // Calculate summary statistics
        $summary = $this->calculateSummary($results, $amount);

        return [
            'comparison' => $results,
            'summary' => $summary,
            'errors' => $errors,
        ];
    }

    /**
     * Calculate summary statistics for comparison
     *
     * @param array $results Simulation results
     * @param float $amountPerStock Investment amount per stock
     * @return array Summary statistics
     */
    private function calculateSummary(array $results, float $amountPerStock): array
    {
        if (empty($results)) {
            return [
                'total_stocks' => 0,
                'total_investment' => 0,
                'total_current_value' => 0,
                'total_profit_loss' => 0,
                'average_return_percentage' => 0,
                'best_performer' => null,
                'worst_performer' => null,
            ];
        }

        $totalInvestment = 0;
        $totalCurrentValue = 0;
        $totalProfitLoss = 0;
        $returns = [];

        foreach ($results as $result) {
            $totalInvestment += $result['investment']['actual_amount'];
            $totalCurrentValue += $result['returns']['current_value'];
            $totalProfitLoss += $result['returns']['profit_loss'];
            $returns[] = $result['returns']['profit_loss_percentage'];
        }

        $averageReturn = count($returns) > 0 ? array_sum($returns) / count($returns) : 0;

        // Find best and worst performers
        $bestPerformer = $results[0] ?? null; // Already sorted descending
        $worstPerformer = $results[count($results) - 1] ?? null;

        return [
            'total_stocks' => count($results),
            'total_investment' => $totalInvestment,
            'total_current_value' => $totalCurrentValue,
            'total_profit_loss' => $totalProfitLoss,
            'total_profit_loss_percentage' => ($totalInvestment > 0) 
                ? ($totalProfitLoss / $totalInvestment) * 100 
                : 0,
            'average_return_percentage' => $averageReturn,
            'best_performer' => $bestPerformer ? [
                'symbol' => $bestPerformer['stock']['symbol'],
                'return_percentage' => $bestPerformer['returns']['profit_loss_percentage'],
            ] : null,
            'worst_performer' => $worstPerformer ? [
                'symbol' => $worstPerformer['stock']['symbol'],
                'return_percentage' => $worstPerformer['returns']['profit_loss_percentage'],
            ] : null,
        ];
    }

    /**
     * Get historical performance data for charting
     *
     * @param string $symbol Stock symbol
     * @param string $startDate Start date
     * @param float $shares Number of shares
     * @return array Historical value data
     */
    public function getHistoricalPerformance(string $symbol, string $startDate, float $shares): array
    {
        $stock = Stock::where('symbol', strtoupper($symbol))->first();
        if (!$stock) {
            throw new \Exception("Stock symbol '{$symbol}' not found");
        }

        $startDate = Carbon::parse($startDate);

        $prices = StockPrice::where('stock_id', $stock->id)
            ->where('date', '>=', $startDate)
            ->orderBy('date', 'asc')
            ->get();

        if ($prices->isEmpty()) {
            return [];
        }

        $initialPrice = (float) $prices->first()->close;
        $initialValue = $shares * $initialPrice;

        $performance = [];
        foreach ($prices as $price) {
            $currentValue = $shares * (float) $price->close;
            $profitLoss = $currentValue - $initialValue;
            $profitLossPercentage = ($initialValue > 0) 
                ? ($profitLoss / $initialValue) * 100 
                : 0;

            $performance[] = [
                'date' => $price->date->format('Y-m-d'),
                'price' => (float) $price->close,
                'value' => $currentValue,
                'profit_loss' => $profitLoss,
                'profit_loss_percentage' => $profitLossPercentage,
            ];
        }

        return $performance;
    }
}
