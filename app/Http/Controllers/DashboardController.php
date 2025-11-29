<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\StockPrice;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $vnIndex = $this->getIndexData('VNINDEX');
            $hnxIndex = $this->getIndexData('HNX-INDEX');
            $upcomIndex = $this->getIndexData('UPCOM-INDEX');

            return Inertia::render('Dashboard/Index', [
                'initialData' => [
                    'indices' => [
                        'vnindex' => $vnIndex,
                        'hnx' => $hnxIndex,
                        'upcom' => $upcomIndex,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            
            return Inertia::render('Dashboard/Index', [
                'initialData' => [
                    'indices' => [
                        'vnindex' => $this->emptyIndexData(),
                        'hnx' => $this->emptyIndexData(),
                        'upcom' => $this->emptyIndexData(),
                    ],
                ],
            ]);
        }
    }

    private function emptyIndexData(): array
    {
        return [
            'value' => 0,
            'change' => 0,
            'changePercent' => 0,
            'volume' => 0,
        ];
    }

    private function getIndexData(string $symbol): array
    {
        try {
            $stock = Stock::where('symbol', $symbol)->first();
            
            if (!$stock) {
                return $this->emptyIndexData();
            }

            $latestPrice = StockPrice::where('stock_id', $stock->id)
                ->orderBy('date', 'desc')
                ->first();

            if (!$latestPrice) {
                return $this->emptyIndexData();
            }

            $previousPrice = StockPrice::where('stock_id', $stock->id)
                ->where('date', '<', $latestPrice->date)
                ->orderBy('date', 'desc')
                ->first();

            if (!$previousPrice) {
                return [
                    'value' => (float) $latestPrice->close,
                    'change' => 0,
                    'changePercent' => 0,
                    'volume' => (int) $latestPrice->volume,
                ];
            }

            $change = $latestPrice->close - $previousPrice->close;
            $changePercent = $previousPrice->close > 0 
                ? ($change / $previousPrice->close) * 100 
                : 0;

            return [
                'value' => (float) $latestPrice->close,
                'change' => round((float) $change, 2),
                'changePercent' => round($changePercent, 2),
                'volume' => (int) $latestPrice->volume,
            ];
        } catch (\Exception $e) {
            Log::error("Error getting index data for {$symbol}: " . $e->getMessage());
            return $this->emptyIndexData();
        }
    }
}
