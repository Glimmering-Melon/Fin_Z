<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnomalyDetectionService;
use App\Models\Watchlist;
use Illuminate\Http\JsonResponse;

class AnomalyController extends Controller
{
    public function __construct(
        private AnomalyDetectionService $anomalyService
    ) {}

    /**
     * Get anomalies for user's watchlist stocks
     */
    public function index(): JsonResponse
    {
        $userId = auth()->id() ?? 1;
        
        $watchlistStockIds = Watchlist::where('user_id', $userId)
            ->pluck('stock_id');
        
        if ($watchlistStockIds->isEmpty()) {
            return response()->json([
                'anomalies' => [],
                'count' => 0,
            ]);
        }
        
        $anomalies = [];
        
        foreach ($watchlistStockIds as $stockId) {
            $stock = \App\Models\Stock::find($stockId);
            if (!$stock) continue;
            
            // Check volume anomaly
            $volumeAnomaly = $this->anomalyService->detectVolumeAnomaly($stockId);
            if ($volumeAnomaly) {
                $anomalies[] = array_merge($volumeAnomaly, [
                    'symbol' => $stock->symbol,
                    'type' => 'volume',
                ]);
            }
            
            // Check price anomaly
            $priceAnomaly = $this->anomalyService->detectPriceAnomaly($stockId);
            if ($priceAnomaly) {
                $anomalies[] = array_merge($priceAnomaly, [
                    'symbol' => $stock->symbol,
                    'type' => 'price',
                ]);
            }
        }
        
        // Sort by severity (z_score descending)
        usort($anomalies, function($a, $b) {
            return abs($b['z_score']) <=> abs($a['z_score']);
        });
        
        return response()->json([
            'anomalies' => $anomalies,
            'count' => count($anomalies),
        ]);
    }
}
