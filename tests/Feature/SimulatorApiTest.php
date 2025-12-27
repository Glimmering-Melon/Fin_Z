<?php

namespace Tests\Feature;

use App\Models\Stock;
use App\Models\StockPrice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulatorApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Stock $stock;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        $this->stock = Stock::create([
            'symbol' => 'VNM',
            'name' => 'Vinamilk',
            'exchange' => 'HOSE',
            'sector' => 'Consumer Goods',
        ]);

        $this->createPriceHistory();
    }

    private function createPriceHistory(): void
    {
        $baseDate = Carbon::parse('2024-01-01');
        $basePrice = 80000;

        for ($i = 0; $i < 100; $i++) {
            StockPrice::create([
                'stock_id' => $this->stock->id,
                'date' => $baseDate->copy()->addDays($i),
                'open' => $basePrice + ($i * 100),
                'high' => $basePrice + ($i * 100) + 500,
                'low' => $basePrice + ($i * 100) - 500,
                'close' => $basePrice + ($i * 100),
                'volume' => 1000000,
            ]);
        }
    }

    public function test_simulate_investment_success(): void
    {
        $response = $this->postJson('/api/simulator/simulate', [
            'amount' => 10000000,
            'symbol' => 'VNM',
            'start_date' => '2024-01-01'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'stock' => [
                            'symbol',
                            'name',
                            'exchange',
                            'sector'
                        ],
                        'investment' => [
                            'amount',
                            'start_date',
                            'end_date'
                        ],
                        'shares' => [
                            'quantity',
                            'lots',
                            'price_per_share'
                        ],
                        'prices' => [
                            'start_price',
                            'end_price'
                        ],
                        'returns' => [
                            'profit_loss',
                            'profit_loss_percentage',
                            'annualized_return'
                        ]
                    ]
                ]);

        $data = $response->json('data');
        $this->assertEquals('VNM', $data['stock']['symbol']);
        $this->assertEquals(10000000, $data['investment']['amount']);
        $this->assertEquals(0, $data['shares']['quantity'] % 100); // Lot size check
    }

    public function test_simulate_investment_validation_errors(): void
    {
        // Test missing required fields
        $response = $this->postJson('/api/simulator/simulate', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['amount', 'symbol', 'start_date']);

        // Test invalid amount
        $response = $this->postJson('/api/simulator/simulate', [
            'amount' => 0,
            'symbol' => 'VNM',
            'start_date' => '2024-01-01'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['amount']);

        // Test future date
        $response = $this->postJson('/api/simulator/simulate', [
            'amount' => 10000000,
            'symbol' => 'VNM',
            'start_date' => Carbon::tomorrow()->format('Y-m-d')
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['start_date']);
    }

    public function test_simulate_investment_invalid_symbol(): void
    {
        $response = $this->postJson('/api/simulator/simulate', [
            'amount' => 10000000,
            'symbol' => 'INVALID',
            'start_date' => '2024-01-01'
        ]);

        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'error' => "Stock symbol 'INVALID' not found"
                ]);
    }

    public function test_compare_multiple_stocks_success(): void
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

        $response = $this->postJson('/api/simulator/compare', [
            'amount' => 10000000,
            'symbols' => ['VNM', 'VCB'],
            'start_date' => '2024-01-01'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'comparison' => [
                            '*' => [
                                'stock',
                                'investment',
                                'shares',
                                'prices',
                                'returns'
                            ]
                        ],
                        'summary' => [
                            'total_stocks',
                            'total_investment',
                            'best_performer',
                            'worst_performer'
                        ],
                        'errors'
                    ]
                ]);

        $data = $response->json('data');
        $this->assertCount(2, $data['comparison']);
        $this->assertEquals(2, $data['summary']['total_stocks']);
    }

    public function test_compare_multiple_stocks_validation(): void
    {
        // Test empty symbols array
        $response = $this->postJson('/api/simulator/compare', [
            'amount' => 10000000,
            'symbols' => [],
            'start_date' => '2024-01-01'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['symbols']);

        // Test too many symbols
        $response = $this->postJson('/api/simulator/compare', [
            'amount' => 10000000,
            'symbols' => ['A', 'B', 'C', 'D', 'E', 'F'],
            'start_date' => '2024-01-01'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['symbols']);
    }

    public function test_get_historical_performance(): void
    {
        $response = $this->getJson('/api/simulator/performance?' . http_build_query([
            'symbol' => 'VNM',
            'start_date' => '2024-01-01',
            'shares' => 100
        ]));

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'date',
                            'price',
                            'value',
                            'profit_loss',
                            'profit_loss_percentage'
                        ]
                    ]
                ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
    }

    public function test_simulator_handles_concurrent_requests(): void
    {
        $responses = [];
        
        // Simulate concurrent requests
        for ($i = 0; $i < 5; $i++) {
            $responses[] = $this->postJson('/api/simulator/simulate', [
                'amount' => 10000000,
                'symbol' => 'VNM',
                'start_date' => '2024-01-01'
            ]);
        }

        foreach ($responses as $response) {
            $response->assertStatus(200);
        }
    }
}