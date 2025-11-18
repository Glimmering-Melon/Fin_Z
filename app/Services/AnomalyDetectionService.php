<?php

namespace App\Services;

class AnomalyDetectionService
{
    public function calculateZScore(array $data, float $value): float
    {
        // TODO: Calculate z-score
        return 0.0;
    }

    public function detectVolumeAnomaly(int $stockId): ?array
    {
        // TODO: Detect volume anomaly
        return null;
    }

    public function detectPriceAnomaly(int $stockId): ?array
    {
        // TODO: Detect price anomaly
        return null;
    }
}
