<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\StockPrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MarketDataController extends Controller
{
    public function overview(): JsonResponse
    {
        // Get latest market data for major indices
        $vnIndex = $this->getIndexData('VNINDEX');
        $hnxIndex = $this->getIndexData('HNX-INDEX');
        $upcomIndex = $this->getIndexData('UPCOM-INDEX');

        return response()->json([
            'indices' => [
                'vnindex' => $vnIndex,
                'hnx' => $hnxIndex,
                'upcom' => $upcomIndex,
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function topGainers(): JsonResponse
    {
        $stocks = $this->getTopStocks('gainers');
        
        return response()->json([
            'stocks' => $stocks,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function topLosers(): JsonResponse
    {
        $stocks = $this->getTopStocks('losers');
        
        return response()->json([
            'stocks' => $stocks,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    private function getIndexData(string $symbol): array
    {
        $stock = Stock::where('symbol', $symbol)->first();
        
        if (!$stock) {
            return [
                'value' => 0,
                'change' => 0,
                'changePercent' => 0,
                'volume' => 0,
            ];
        }

        $latestPrice = StockPrice::where('stock_id', $stock->id)
            ->orderBy('date', 'desc')
            ->first();

        $previousPrice = StockPrice::where('stock_id', $stock->id)
            ->where('date', '<', $latestPrice?->date)
            ->orderBy('date', 'desc')
            ->first();

        if (!$latestPrice || !$previousPrice) {
            return [
                'value' => $latestPrice?->close ?? 0,
                'change' => 0,
                'changePercent' => 0,
                'volume' => $latestPrice?->volume ?? 0,
            ];
        }

        $change = $latestPrice->close - $previousPrice->close;
        $changePercent = ($change / $previousPrice->close) * 100;

        return [
            'value' => (float) $latestPrice->close,
            'change' => (float) $change,
            'changePercent' => round($changePercent, 2),
            'volume' => (int) $latestPrice->volume,
        ];
    }

    private function getTopStocks(string $type): array
    {
        $subquery = StockPrice::select('stock_id', DB::raw('MAX(date) as max_date'))
            ->groupBy('stock_id');

        $query = StockPrice::joinSub($subquery, 'latest', function ($join) {
                $join->on('stock_prices.stock_id', '=', 'latest.stock_id')
                     ->on('stock_prices.date', '=', 'latest.max_date');
            })
            ->join('stocks', 'stock_prices.stock_id', '=', 'stocks.id')
            ->select(
                'stocks.id',
                'stocks.symbol',
                'stocks.name',
                'stocks.exchange',
                'stock_prices.close as price',
                'stock_prices.volume',
                'stock_prices.date',
                DB::raw('(
                    SELECT close 
                    FROM stock_prices sp2 
                    WHERE sp2.stock_id = stock_prices.stock_id 
                    AND sp2.date < stock_prices.date 
                    ORDER BY sp2.date DESC 
                    LIMIT 1
                ) as previous_close')
            )
            ->whereNotIn('stocks.symbol', ['VNINDEX', 'HNX-INDEX', 'UPCOM-INDEX'])
            ->havingRaw('previous_close IS NOT NULL');

        if ($type === 'gainers') {
            $query->orderByRaw('((close - previous_close) / previous_close) DESC');
        } else {
            $query->orderByRaw('((close - previous_close) / previous_close) ASC');
        }

        $results = $query->limit(10)->get();

        return $results->map(function ($item) {
            $change = $item->price - $item->previous_close;
            $changePercent = ($change / $item->previous_close) * 100;

            return [
                'id' => $item->id,
                'symbol' => $item->symbol,
                'name' => $item->name,
                'exchange' => $item->exchange,
                'price' => (float) $item->price,
                'change' => (float) $change,
                'changePercent' => round($changePercent, 2),
                'volume' => (int) $item->volume,
            ];
        })->toArray();
    }
}
