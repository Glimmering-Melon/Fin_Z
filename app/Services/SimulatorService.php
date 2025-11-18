<?php

namespace App\Services;

class SimulatorService
{
    public function simulate(float $amount, string $symbol, string $startDate): array
    {
        // TODO: Calculate investment simulation
        // - Get historical price at start date
        // - Get current price
        // - Calculate shares bought
        // - Calculate P/L and percentage
        return [];
    }

    public function compareMultiple(float $amount, array $symbols, string $startDate): array
    {
        // TODO: Compare multiple stocks
        return [];
    }
}
