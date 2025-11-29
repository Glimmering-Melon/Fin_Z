<?php

namespace Tests\Unit;

use App\Models\Stock;
use App\Models\StockPrice;
use App\Services\SimulatorService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulatorServiceTest extends TestCase
{
    use RefreshDatabase;

    private SimulatorService $service;
    private Stock $stock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SimulatorService();

        // Create test stock
        $this->stock = Stock::create([
            'symbol' => 'VNM',
            'name' => 'Vinamilk',
            'exchange' => 'HOSE',
            'sector' => 'Consumer Goods',
        ]);

        // Create price history
        $this->createPriceHistory();
    }

    private function createPriceHistory(): void
    {
        $baseDate = Carbon::parse('2024-01-01');
        $basePrice = 80000;

        for ($i = 0; $i < 100; $i++) {
            $date = $baseDate->copy()->addDays($i);
            $price = $basePrice + ($i * 100); // Price increases by 100 VND per day

            StockPrice::create([
                'stock_id' => $this->stock->id,
                'date' => $date,
                'open' => $price,
                'high' => $price + 500,
                'low' => $price - 500,
                'close' => $price,
                'volume' => 1000000,
            ]);
        }
    }

    public function test_simulate_calculates_profit_correctly(): void
    {
        $result = $this->service->simulate(
            amount: 10000000, // 10 million VND
            symbol: 'VNM',
            startDate: '2024-01-01'
        );

        $this->assertArrayHasKey('stock', $result);
        $this->assertArrayHasKey('investment', $result);
        $this->assertArrayHasKey('prices', $result);
        $this->assertArrayHasKey('shares', $result);
        $this->assertArrayHasKey('returns', $result);

        // Check stock info
        $this->assertEquals('VNM', $result['stock']['symbol']);
        $this->assertEquals('Vinamilk', $result['stock']['name']);

        // Check shares calculation (should be rounded to nearest 100)
        $this->assertEquals(0, $result['shares']['quantity'] % 100);
        $this->assertGreaterThan(0, $result['shares']['quantity']);

        // Check profit/loss calculation
        $this->assertGreaterThan(0, $result['returns']['profit_loss']);
        $this->assertGreaterThan(0, $result['returns']['profit_loss_percentage']);
    }

    public function test_simulate_throws_exception_for_invalid_symbol(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Stock symbol 'INVALID' not found");

        $this->service->simulate(
            amount: 10000000,
            symbol: 'INVALID',
            startDate: '2024-01-01'
        );
    }

    public function test_simulate_throws_exception_for_zero_amount(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Investment amount must be greater than 0');

        $this->service->simulate(
            amount: 0,
            symbol: 'VNM',
            startDate: '2024-01-01'
        );
    }

    public function test_simulate_throws_exception_for_future_date(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Start date cannot be in the future');

        $futureDate = Carbon::tomorrow()->format('Y-m-d');

        $this->service->simulate(
            amount: 10000000,
            symbol: 'VNM',
            startDate: $futureDate
        );
    }

    public function test_simulate_throws_exception_for_insufficient_amount(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Investment amount too small');

        $this->service->simulate(
            amount: 1000, // Too small to buy even 100 shares
            symbol: 'VNM',
            startDate: '2024-01-01'
        );
    }

    public function test_compare_multiple_stocks(): void
    {
        // Create second stock
        $stock2 = Stock::create([
            'symbol' => 'VCB',
            'name' => 'Vietcombank',
            'exchange' => 'HOSE',
            'sector' => 'Banking',
        ]);

        // Create price history for second stock
        $baseDate = Carbon::parse('2024-01-01');
        for ($i = 0; $i < 100; $i++) {
            StockPrice::create([
                'stock_id' => $stock2->id,
                'date' => $baseDate->copy()->addDays($i),
                'open' => 90000 + ($i * 50),
                'high' => 90000 + ($i * 50) + 500,
                'low' => 90000 + ($i * 50) - 500,
                'close' => 90000 + ($i * 50),
                'volume' => 500000,
            ]);
        }

        $result = $this->service->compareMultiple(
            amount: 10000000,
            symbols: ['VNM', 'VCB'],
            startDate: '2024-01-01'
        );

        $this->assertArrayHasKey('comparison', $result);
        $this->assertArrayHasKey('summary', $result);
        $this->assertArrayHasKey('errors', $result);

        // Check comparison results
        $this->assertCount(2, $result['comparison']);

        // Check summary
        $this->assertEquals(2, $result['summary']['total_stocks']);
        $this->assertGreaterThan(0, $result['summary']['total_investment']);
        $this->assertArrayHasKey('best_performer', $result['summary']);
        $this->assertArrayHasKey('worst_performer', $result['summary']);
    }

    public function test_compare_multiple_handles_invalid_symbols(): void
    {
        $result = $this->service->compareMultiple(
            amount: 10000000,
            symbols: ['VNM', 'INVALID'],
            startDate: '2024-01-01'
        );

        $this->assertCount(1, $result['comparison']); // Only VNM succeeds
        $this->assertCount(1, $result['errors']); // INVALID fails
        $this->assertEquals('INVALID', $result['errors'][0]['symbol']);
    }

    public function test_compare_multiple_throws_exception_for_empty_symbols(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('At least one stock symbol is required');

        $this->service->compareMultiple(
            amount: 10000000,
            symbols: [],
            startDate: '2024-01-01'
        );
    }

    public function test_compare_multiple_throws_exception_for_too_many_symbols(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Maximum 5 stocks can be compared at once');

        $this->service->compareMultiple(
            amount: 10000000,
            symbols: ['A', 'B', 'C', 'D', 'E', 'F'],
            startDate: '2024-01-01'
        );
    }

    public function test_get_historical_performance(): void
    {
        $result = $this->service->getHistoricalPerformance(
            symbol: 'VNM',
            startDate: '2024-01-01',
            shares: 100
        );

        $this->assertIsArray($result);
        $this->assertNotEmpty($result);

        // Check first entry
        $firstEntry = $result[0];
        $this->assertArrayHasKey('date', $firstEntry);
        $this->assertArrayHasKey('price', $firstEntry);
        $this->assertArrayHasKey('value', $firstEntry);
        $this->assertArrayHasKey('profit_loss', $firstEntry);
        $this->assertArrayHasKey('profit_loss_percentage', $firstEntry);

        // Check that performance data is sorted by date
        $dates = array_column($result, 'date');
        $sortedDates = $dates;
        sort($sortedDates);
        $this->assertEquals($sortedDates, $dates);
    }

    public function test_shares_are_rounded_to_lot_size(): void
    {
        $result = $this->service->simulate(
            amount: 10500000, // Amount that doesn't divide evenly
            symbol: 'VNM',
            startDate: '2024-01-01'
        );

        // Shares should be multiple of 100 (lot size)
        $this->assertEquals(0, $result['shares']['quantity'] % 100);
        $this->assertEquals($result['shares']['quantity'] / 100, $result['shares']['lots']);
    }

    public function test_annualized_return_calculation(): void
    {
        $result = $this->service->simulate(
            amount: 10000000,
            symbol: 'VNM',
            startDate: '2024-01-01'
        );

        $this->assertArrayHasKey('annualized_return', $result['returns']);
        $this->assertIsFloat($result['returns']['annualized_return']);
    }
}
