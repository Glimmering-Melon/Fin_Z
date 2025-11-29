<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 1) {
            return response()->json(['results' => []]);
        }

        $stocks = Stock::where(function ($q) use ($query) {
                $q->where('symbol', 'like', "%{$query}%")
                  ->orWhere('name', 'like', "%{$query}%");
            })
            ->whereNotIn('symbol', ['VNINDEX', 'HNX-INDEX', 'UPCOM-INDEX'])
            ->limit(10)
            ->get(['id', 'symbol', 'name', 'exchange']);

        return response()->json([
            'results' => $stocks,
        ]);
    }
}
