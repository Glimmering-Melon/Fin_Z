<?php

namespace App\Http\Controllers;

use App\Models\Watchlist;
use App\Models\Stock;
use App\Models\StockPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WatchlistController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $watchlist = Watchlist::where('user_id', $userId)
            ->with(['stock' => function ($query) {
                $query->select('id', 'symbol', 'name', 'exchange');
            }])
            ->get();

        $stockIds = $watchlist->pluck('stock_id');

        // Get latest prices for watchlist stocks
        $latestPrices = StockPrice::whereIn('stock_id', $stockIds)
            ->whereIn('date', function ($query) use ($stockIds) {
                $query->select(DB::raw('MAX(date)'))
                    ->from('stock_prices')
                    ->whereIn('stock_id', $stockIds)
                    ->groupBy('stock_id');
            })
            ->get()
            ->keyBy('stock_id');

        // Get previous prices for change calculation
        $previousPrices = [];
        foreach ($stockIds as $stockId) {
            $latestDate = $latestPrices[$stockId]->date ?? null;
            if ($latestDate) {
                $previous = StockPrice::where('stock_id', $stockId)
                    ->where('date', '<', $latestDate)
                    ->orderBy('date', 'desc')
                    ->first();
                if ($previous) {
                    $previousPrices[$stockId] = $previous;
                }
            }
        }

        $data = $watchlist->map(function ($item) use ($latestPrices, $previousPrices) {
            $stockId = $item->stock_id;
            $latestPrice = $latestPrices[$stockId] ?? null;
            $previousPrice = $previousPrices[$stockId] ?? null;

            $price = $latestPrice ? (float) $latestPrice->close : 0;
            $change = 0;
            $changePercent = 0;

            if ($latestPrice && $previousPrice) {
                $change = $price - (float) $previousPrice->close;
                $changePercent = ($change / (float) $previousPrice->close) * 100;
            }

            return [
                'id' => $item->id,
                'stock_id' => $item->stock_id,
                'symbol' => $item->stock->symbol,
                'name' => $item->stock->name,
                'exchange' => $item->stock->exchange,
                'price' => $price,
                'change' => round($change, 2),
                'changePercent' => round($changePercent, 2),
                'volume' => $latestPrice ? (int) $latestPrice->volume : 0,
            ];
        });

        return response()->json([
            'watchlist' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'stock_id' => ['required', 'exists:stocks,id'],
        ]);

        $userId = auth()->id();
        $stockId = $request->input('stock_id');

        $exists = Watchlist::where('user_id', $userId)
            ->where('stock_id', $stockId)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Stock already in watchlist',
            ], 409);
        }

        $watchlist = Watchlist::create([
            'user_id' => $userId,
            'stock_id' => $stockId,
        ]);

        return response()->json([
            'message' => 'Stock added to watchlist',
            'watchlist' => $watchlist,
        ], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $userId = auth()->id();

        $watchlist = Watchlist::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$watchlist) {
            return response()->json([
                'message' => 'Watchlist item not found',
            ], 404);
        }

        $watchlist->delete();

        return response()->json([
            'message' => 'Stock removed from watchlist',
        ]);
    }
}
