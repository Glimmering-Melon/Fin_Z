<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Watchlist;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WatchlistController extends Controller
{
    public function index()
    {
        $userId = Auth::id() ?? 1; // TODO: Remove fallback when auth is implemented
        
        $watchlist = Watchlist::where('user_id', $userId)
            ->with(['stock.prices' => function ($query) {
                $query->latest()->limit(2);
            }])
            ->get()
            ->map(function ($item) {
                $stock = $item->stock;
                $prices = $stock->prices;
                
                $currentPrice = $prices->first();
                $previousPrice = $prices->skip(1)->first();
                
                $change = 0;
                $changePercent = 0;
                
                if ($currentPrice && $previousPrice) {
                    $change = $currentPrice->close - $previousPrice->close;
                    $changePercent = ($change / $previousPrice->close) * 100;
                }
                
                return [
                    'id' => $item->id,
                    'stock_id' => $stock->id,
                    'symbol' => $stock->symbol,
                    'name' => $stock->name,
                    'price' => $currentPrice ? $currentPrice->close : 0,
                    'change' => round($change, 2),
                    'change_percent' => round($changePercent, 2),
                    'added_at' => $item->created_at,
                ];
            });
        
        return response()->json($watchlist);
    }

    public function store(Request $request)
    {
        $request->validate([
            'symbol' => 'required|string',
        ]);
        
        $userId = Auth::id() ?? 1; // TODO: Remove fallback when auth is implemented
        
        $stock = Stock::where('symbol', $request->symbol)->first();
        
        if (!$stock) {
            return response()->json([
                'message' => 'Stock not found'
            ], 404);
        }
        
        $existing = Watchlist::where('user_id', $userId)
            ->where('stock_id', $stock->id)
            ->first();
        
        if ($existing) {
            return response()->json([
                'message' => 'Stock already in watchlist'
            ], 409);
        }
        
        $watchlist = Watchlist::create([
            'user_id' => $userId,
            'stock_id' => $stock->id,
        ]);
        
        return response()->json([
            'message' => 'Stock added to watchlist',
            'data' => $watchlist
        ], 201);
    }

    public function destroy($id)
    {
        $userId = Auth::id() ?? 1; // TODO: Remove fallback when auth is implemented
        
        $watchlist = Watchlist::where('id', $id)
            ->where('user_id', $userId)
            ->first();
        
        if (!$watchlist) {
            return response()->json([
                'message' => 'Watchlist item not found'
            ], 404);
        }
        
        $watchlist->delete();
        
        return response()->json([
            'message' => 'Stock removed from watchlist'
        ]);
    }
}
