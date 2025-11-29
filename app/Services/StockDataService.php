<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockPrice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockDataService
{
    private AlphaVantageService $alphaVantage;

    public function __construct(AlphaVantageService $alphaVantage)
    {
        $this->alphaVantage = $alphaVantage;
    }

    /**
     * Get stock historical data from database
     * Falls back to API if not in database
     */
    public function getHistoricalData(string $symbol, int $days = 100): ?array
    {
        $stock = Stock::where('symbol', $symbol)->first();

        if (!$stock) {
            // Stock not in database, try to fetch from API
            return $this->fetchAndSaveFromAPI($symbol, $days);
        }

        // Get data from database
        $prices = StockPrice::where('stock_id', $stock->id)
            ->orderBy('date', 'asc')
            ->limit($days)
            ->get();

        // If no data or data is old, fetch from API
        if ($prices->isEmpty() || $this->isDataStale($prices)) {
            return $this->fetchAndSaveFromAPI($symbol, $days);
        }

        return $this->formatPriceData($prices);
    }

    /**
     * Get latest price for a stock
     */
    public function getLatestPrice(string $symbol): ?array
    {
        $stock = Stock::where('symbol', $symbol)->first();

        if (!$stock) {
            return null;
        }

        $latestPrice = StockPrice::where('stock_id', $stock->id)
            ->orderBy('date', 'desc')
            ->first();

        if (!$latestPrice) {
            return null;
        }

        $previousPrice = StockPrice::where('stock_id', $stock->id)
            ->where('date', '<', $latestPrice->date)
            ->orderBy('date', 'desc')
            ->first();

        $change = $previousPrice 
            ? $latestPrice->close - $previousPrice->close 
            : 0;
        
        $changePercent = $previousPrice && $previousPrice->close > 0
            ? ($change / $previousPrice->close) * 100
            : 0;

        return [
            'symbol' => $stock->symbol,
            'date' => $latestPrice->date,
            'open' => (float) $latestPrice->open,
            'high' => (float) $latestPrice->high,
            'low' => (float) $latestPrice->low,
            'close' => (float) $latestPrice->close,
            'volume' => (int) $latestPrice->volume,
            'change' => round($change, 2),
            'changePercent' => round($changePercent, 2),
        ];
    }

    /**
     * Check if data is stale (older than 1 day)
     */
    private function isDataStale($prices): bool
    {
        $latestDate = $prices->last()->date;
        $yesterday = now()->subDay()->format('Y-m-d');
        
        return $latestDate < $yesterday;
    }

    /**
     * Fetch from API and save to database
     */
    private function fetchAndSaveFromAPI(string $symbol, int $days): ?array
    {
        try {
            Log::info("Fetching {$symbol} from API (not in database or stale)");
            
            $data = $this->alphaVantage->getDailyTimeSeries($symbol, true);
            
            if (!$data) {
                return null;
            }

            // Get or create stock
            $stock = Stock::firstOrCreate(
                ['symbol' => $symbol],
                [
                    'name' => $symbol,
                    'exchange' => 'US',
                ]
            );

            // Save to database
            foreach ($data['timestamps'] as $index => $date) {
                StockPrice::updateOrCreate(
                    [
                        'stock_id' => $stock->id,
                        'date' => $date,
                    ],
                    [
                        'open' => $data['open'][$index],
                        'high' => $data['high'][$index],
                        'low' => $data['low'][$index],
                        'close' => $data['close'][$index],
                        'volume' => $data['volume'][$index],
                    ]
                );
            }

            return $data;
        } catch (\Exception $e) {
            Log::error("Error fetching from API: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Format price data from database
     */
    private function formatPriceData($prices): array
    {
        return [
            'timestamps' => $prices->pluck('date')->toArray(),
            'open' => $prices->pluck('open')->map(fn($v) => (float) $v)->toArray(),
            'high' => $prices->pluck('high')->map(fn($v) => (float) $v)->toArray(),
            'low' => $prices->pluck('low')->map(fn($v) => (float) $v)->toArray(),
            'close' => $prices->pluck('close')->map(fn($v) => (float) $v)->toArray(),
            'volume' => $prices->pluck('volume')->map(fn($v) => (int) $v)->toArray(),
        ];
    }

    /**
     * Get top gainers/losers
     */
    public function getTopMovers(string $type = 'gainers', int $limit = 10): array
    {
        $subquery = StockPrice::select('stock_id', DB::raw('MAX(date) as max_date'))
            ->groupBy('stock_id');

        $query = StockPrice::joinSub($subquery, 'latest', function ($join) {
                $join->on('stock_prices.stock_id', '=', 'latest.stock_id')
                     ->on('stock_prices.date', '=', 'latest.max_date');
            })
            ->join('stocks', 'stock_prices.stock_id', '=', 'stocks.id')
            ->select(
                'stocks.symbol',
                'stocks.name',
                'stock_prices.close as price',
                'stock_prices.volume',
                DB::raw('(
                    SELECT close 
                    FROM stock_prices sp2 
                    WHERE sp2.stock_id = stock_prices.stock_id 
                    AND sp2.date < stock_prices.date 
                    ORDER BY sp2.date DESC 
                    LIMIT 1
                ) as previous_close')
            )
            ->havingRaw('previous_close IS NOT NULL');

        if ($type === 'gainers') {
            $query->orderByRaw('((close - previous_close) / previous_close) DESC');
        } else {
            $query->orderByRaw('((close - previous_close) / previous_close) ASC');
        }

        return $query->limit($limit)
            ->get()
            ->map(function ($item) {
                $change = $item->price - $item->previous_close;
                $changePercent = ($change / $item->previous_close) * 100;

                return [
                    'symbol' => $item->symbol,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                    'change' => round($change, 2),
                    'changePercent' => round($changePercent, 2),
                    'volume' => (int) $item->volume,
                ];
            })
            ->toArray();
    }
}
