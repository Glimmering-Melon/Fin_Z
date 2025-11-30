<?php

namespace App\Jobs;

use App\Services\NewsApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchStockNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes
    public $tries = 3;

    public function __construct()
    {
        //
    }

    public function handle(NewsApiService $service): void
    {
        Log::info('Starting fetch stock news job');

        try {
            // Fetch news from API
            $newsArticles = $service->fetchNews([], 50);

            $savedCount = 0;
            $duplicateCount = 0;
            $errorCount = 0;

            foreach ($newsArticles as $article) {
                try {
                    $news = $service->saveNews($article);
                    
                    if ($news) {
                        $savedCount++;
                        Log::info('News saved', [
                            'title' => $news->title,
                            'sentiment' => $news->sentiment
                        ]);
                    } else {
                        $duplicateCount++;
                    }
                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error('Failed to save news article', [
                        'title' => $article['title'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('Fetch stock news job completed', [
                'fetched' => count($newsArticles),
                'saved' => $savedCount,
                'duplicates' => $duplicateCount,
                'errors' => $errorCount
            ]);

        } catch (\Exception $e) {
            Log::error('Fetch stock news job failed', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('FetchStockNewsJob failed', [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}

