<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockPrice;
use App\Models\Alert;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnomalyDetectionService
{
    private int $rollingWindow;
    private float $zScoreThreshold;

    public function __construct()
    {
        $this->rollingWindow = config('stock.anomaly.rolling_window', 30);
        $this->zScoreThreshold = config('stock.anomaly.z_score_threshold', 2.0);
    }

    /**
     * Calculate z-score for a value given a dataset
     */
    public function calculateZScore(array $data, float $value): float
    {
        if (count($data) < 2) {
            return 0.0;
        }

        $mean = array_sum($data) / count($data);
        
        $variance = 0;
        foreach ($data as $val) {
            $variance += pow($val - $mean, 2);
        }
        $variance = $variance / count($data);
        
        $stdDev = sqrt($variance);
        
        if ($stdDev == 0) {
            return 0.0;
        }

        return ($value - $mean) / $stdDev;
    }

    /**
     * Detect volume anomaly for a stock
     */
    public function detectVolumeAnomaly(int $stockId): ?array
    {
        try {
            $stock = Stock::findOrFail($stockId);
            
            // Get last N days of volume data
            $prices = StockPrice::where('stock_id', $stockId)
                ->orderBy('date', 'desc')
                ->limit($this->rollingWindow + 1)
                ->get();

            if ($prices->count() < $this->rollingWindow) {
                return null;
            }

            $latestPrice = $prices->first();
            $historicalVolumes = $prices->skip(1)->pluck('volume')->toArray();
            
            $zScore = $this->calculateZScore($historicalVolumes, $latestPrice->volume);

            if (abs($zScore) >= $this->zScoreThreshold) {
                $severity = $this->calculateSeverity($zScore);
                
                return [
                    'stock_id' => $stockId,
                    'type' => 'volume_spike',
                    'severity' => $severity,
                    'z_score' => round($zScore, 4),
                    'message' => sprintf(
                        'Volume anomaly detected for %s: %.2f (z-score: %.2f)',
                        $stock->symbol,
                        $latestPrice->volume,
                        $zScore
                    ),
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Volume anomaly detection failed', [
                'stock_id' => $stockId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Detect price anomaly (returns) for a stock
     */
    public function detectPriceAnomaly(int $stockId): ?array
    {
        try {
            $stock = Stock::findOrFail($stockId);
            
            // Get last N days of price data
            $prices = StockPrice::where('stock_id', $stockId)
                ->orderBy('date', 'desc')
                ->limit($this->rollingWindow + 1)
                ->get();

            if ($prices->count() < $this->rollingWindow) {
                return null;
            }

            // Calculate returns (percentage change)
            $returns = [];
            for ($i = 0; $i < $prices->count() - 1; $i++) {
                $currentPrice = $prices[$i]->close;
                $previousPrice = $prices[$i + 1]->close;
                
                if ($previousPrice > 0) {
                    $returns[] = (($currentPrice - $previousPrice) / $previousPrice) * 100;
                }
            }

            if (count($returns) < 2) {
                return null;
            }

            $latestReturn = $returns[0];
            $historicalReturns = array_slice($returns, 1);
            
            $zScore = $this->calculateZScore($historicalReturns, $latestReturn);

            if (abs($zScore) >= $this->zScoreThreshold) {
                $severity = $this->calculateSeverity($zScore);
                
                return [
                    'stock_id' => $stockId,
                    'type' => 'price_jump',
                    'severity' => $severity,
                    'z_score' => round($zScore, 4),
                    'message' => sprintf(
                        'Price anomaly detected for %s: %.2f%% change (z-score: %.2f)',
                        $stock->symbol,
                        $latestReturn,
                        $zScore
                    ),
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Price anomaly detection failed', [
                'stock_id' => $stockId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Calculate severity based on z-score
     */
    private function calculateSeverity(float $zScore): string
    {
        $absZScore = abs($zScore);
        
        if ($absZScore >= 3.0) {
            return 'high';
        } elseif ($absZScore >= 2.5) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Create alert in database
     */
    public function createAlert(array $alertData): void
    {
        Alert::create($alertData);
    }
}
