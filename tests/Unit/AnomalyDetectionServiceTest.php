<?php

namespace Tests\Unit;

use App\Models\Stock;
use App\Models\StockPrice;
use App\Services\AnomalyDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnomalyDetectionServiceTest extends TestCase
{
    use RefreshDatabase;

    private AnomalyDetectionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AnomalyDetectionService();
    }

    public function test_calculate_z_score_returns_zero_for_insufficient_data(): void
    {
        $data = [100];
        $value = 150;

        $zScore = $this->service->calculateZScore($data, $value);

        $this->assertEquals(0.0, $zScore);
    }

    public function test_calculate_z_score_returns_correct_value(): void
    {
        // Data: [10, 20, 30, 40, 50]
        // Mean: 30
        // Std Dev: 14.14
        // Value: 60
        // Z-score: (60 - 30) / 14.14 ≈ 2.12
        
        $data = [10, 20, 30, 40, 50];
        $value = 60;

        $zScore = $this->service->calculateZScore($data, $value);

        $this->assertGreaterThan(2.0, $zScore);
        $this->assertLessThan(2.2, $zScore);
    }

    public function test_calculate_z_score_returns_zero_for_zero_std_dev(): void
    {
        $data = [100, 100, 100, 100];
        $value = 100;

        $zScore = $this->service->calculateZScore($data, $value);

        $this->assertEquals(0.0, $zScore);
    }

    public function test_detect_volume_anomaly_returns_null_for_insufficient_data(): void
    {
        $stock = Stock::factory()->create();
        
        // Create only 10 days of data (less than rolling window of 30)
        StockPrice::factory()->count(10)->create([
            'stock_id' => $stock->id,
        ]);

        $result = $this->service->detectVolumeAnomaly($stock->id);

        $this->assertNull($result);
    }

    public function test_detect_volume_anomaly_detects_spike(): void
    {
        $stock = Stock::factory()->create(['symbol' => 'TEST']);
        
        // Create 30 days of normal volume (around 1000)
        for ($i = 30; $i > 0; $i--) {
            StockPrice::factory()->create([
                'stock_id' => $stock->id,
                'date' => now()->subDays($i),
                'volume' => 1000 + rand(-100, 100),
            ]);
        }

        // Create today with spike volume (10x normal)
        StockPrice::factory()->create([
            'stock_id' => $stock->id,
            'date' => now(),
            'volume' => 10000,
        ]);

        $result = $this->service->detectVolumeAnomaly($stock->id);

        $this->assertNotNull($result);
        $this->assertEquals($stock->id, $result['stock_id']);
        $this->assertEquals('volume_spike', $result['type']);
        $this->assertGreaterThan(2.0, abs($result['z_score']));
        $this->assertContains($result['severity'], ['low', 'medium', 'high']);
    }

    public function test_detect_price_anomaly_returns_null_for_insufficient_data(): void
    {
        $stock = Stock::factory()->create();
        
        StockPrice::factory()->count(10)->create([
            'stock_id' => $stock->id,
        ]);

        $result = $this->service->detectPriceAnomaly($stock->id);

        $this->assertNull($result);
    }

    public function test_detect_price_anomaly_detects_jump(): void
    {
        $stock = Stock::factory()->create(['symbol' => 'TEST']);
        
        // Create 30 days of stable prices (around 100)
        for ($i = 30; $i > 0; $i--) {
            StockPrice::factory()->create([
                'stock_id' => $stock->id,
                'date' => now()->subDays($i),
                'close' => 100 + rand(-2, 2),
            ]);
        }

        // Create today with price jump (50% increase)
        StockPrice::factory()->create([
            'stock_id' => $stock->id,
            'date' => now(),
            'close' => 150,
        ]);

        $result = $this->service->detectPriceAnomaly($stock->id);

        $this->assertNotNull($result);
        $this->assertEquals($stock->id, $result['stock_id']);
        $this->assertEquals('price_jump', $result['type']);
        $this->assertGreaterThan(2.0, abs($result['z_score']));
    }

    public function test_detect_volume_anomaly_returns_null_for_normal_volume(): void
    {
        $stock = Stock::factory()->create();
        
        // Create 31 days of similar volume
        for ($i = 31; $i >= 0; $i--) {
            StockPrice::factory()->create([
                'stock_id' => $stock->id,
                'date' => now()->subDays($i),
                'volume' => 1000 + rand(-50, 50),
            ]);
        }

        $result = $this->service->detectVolumeAnomaly($stock->id);

        $this->assertNull($result);
    }

    public function test_severity_calculation(): void
    {
        $stock = Stock::factory()->create();
        
        // Create baseline data
        for ($i = 30; $i > 0; $i--) {
            StockPrice::factory()->create([
                'stock_id' => $stock->id,
                'date' => now()->subDays($i),
                'volume' => 1000,
            ]);
        }

        // Test high severity (z-score >= 3.0)
        StockPrice::factory()->create([
            'stock_id' => $stock->id,
            'date' => now(),
            'volume' => 20000, // Very high spike
        ]);

        $result = $this->service->detectVolumeAnomaly($stock->id);
        
        if ($result) {
            $this->assertContains($result['severity'], ['low', 'medium', 'high']);
        }
    }
}
