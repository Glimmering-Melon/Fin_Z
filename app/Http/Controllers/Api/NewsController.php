<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NewsController extends Controller
{
    /**
     * Get list of news with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = News::query();

        // Filter by sentiment
        if ($request->has('sentiment')) {
            $query->where('sentiment', $request->sentiment);
        }

        // Filter by minimum sentiment score
        if ($request->has('min_score')) {
            $query->where('sentiment_score', '>=', $request->min_score);
        }

        // Filter by maximum sentiment score
        if ($request->has('max_score')) {
            $query->where('sentiment_score', '<=', $request->max_score);
        }

        // Search by keyword in title or content
        if ($request->has('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', '%' . $keyword . '%')
                  ->orWhere('content', 'like', '%' . $keyword . '%');
            });
        }

        // Filter by source
        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('published_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('published_at', '<=', $request->date_to);
        }

        // Order by newest first
        $query->orderBy('published_at', 'desc');

        // Paginate results
        $perPage = $request->input('per_page', 20);
        $news = $query->paginate($perPage);

        return response()->json($news);
    }

    /**
     * Get single news article
     */
    public function show(int $id): JsonResponse
    {
        $news = News::with('stocks')->findOrFail($id);

        return response()->json($news);
    }

    /**
     * Get news statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => News::count(),
            'by_sentiment' => [
                'positive' => News::where('sentiment', 'positive')->count(),
                'neutral' => News::where('sentiment', 'neutral')->count(),
                'negative' => News::where('sentiment', 'negative')->count(),
            ],
            'recent' => News::where('published_at', '>=', now()->subDays(7))->count(),
            'sources' => News::select('source')
                ->groupBy('source')
                ->selectRaw('source, count(*) as count')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get available sources
     */
    public function sources(): JsonResponse
    {
        $sources = News::select('source')
            ->distinct()
            ->orderBy('source')
            ->pluck('source');

        return response()->json($sources);
    }
}
