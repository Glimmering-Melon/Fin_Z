<?php

namespace App\Jobs;

use App\Models\Stock;
use App\Services\AnomalyDetectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DetectAnomaliesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes
    public $tries = 3;

    public function __construct()
    {
        //
    }

    public function handle(AnomalyDetectionService $service): void
    {
        Log::info('Starting anomaly detection job');

        $stocks = Stock::all();
        $alertsCreated = 0;
        $errors = 0;

        foreach ($stocks as $stock) {
            try {
                // Detect volume anomaly
                $volumeAnomaly = $service->detectVolumeAnomaly($stock->id);
                if ($volumeAnomaly) {
                    $service->createAlert($volumeAnomaly);
                    $alertsCreated++;
                    Log::info('Volume anomaly detected', ['stock' => $stock->symbol]);
                }

                // Detect price anomaly
                $priceAnomaly = $service->detectPriceAnomaly($stock->id);
                if ($priceAnomaly) {
                    $service->createAlert($priceAnomaly);
                    $alertsCreated++;
                    Log::info('Price anomaly detected', ['stock' => $stock->symbol]);
                }
            } catch (\Exception $e) {
                $errors++;
                Log::error('Anomaly detection failed for stock', [
                    'stock_id' => $stock->id,
                    'symbol' => $stock->symbol,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Anomaly detection job completed', [
            'stocks_processed' => $stocks->count(),
            'alerts_created' => $alertsCreated,
            'errors' => $errors
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('DetectAnomaliesJob failed', [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
