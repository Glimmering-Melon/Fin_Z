<?php

namespace App\Console\Commands;

use App\Models\Stock;
use App\Models\StockPrice;
use App\Services\AlphaVantageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchDailyStockData extends Command
{
    protected $signature = 'stock:fetch-daily {--symbol=* : Specific symbols to fetch} {--all : Fetch all stocks}';
    protected $description = 'Fetch daily stock data from Alpha Vantage and save to database';

    private AlphaVantageService $alphaVantage;

    public function __construct(AlphaVantageService $alphaVantage)
    {
        parent::__construct();
        $this->alphaVantage = $alphaVantage;
    }

    public function handle(): int
    {
        $this->info('Starting daily stock data fetch...');

        // Get stocks to fetch
        $symbols = $this->option('symbol');
        
        if ($this->option('all')) {
            $stocks = Stock::all();
            $this->info("Fetching data for all {$stocks->count()} stocks...");
        } elseif (!empty($symbols)) {
            $stocks = Stock::whereIn('symbol', $symbols)->get();
            $this->info("Fetching data for " . count($symbols) . " specific stocks...");
        } else {
            // Default: Fetch popular US stocks
            $defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];
            $stocks = Stock::whereIn('symbol', $defaultSymbols)->get();
            
            // Create stocks if they don't exist
            foreach ($defaultSymbols as $symbol) {
                if (!$stocks->contains('symbol', $symbol)) {
                    $stock = Stock::create([
                        'symbol' => $symbol,
                        'name' => $symbol,
                        'exchange' => 'US',
                    ]);
                    $stocks->push($stock);
                }
            }
            
            $this->info("Fetching data for {$stocks->count()} default stocks...");
        }

        $successCount = 0;
        $errorCount = 0;
        $bar = $this->output->createProgressBar($stocks->count());

        foreach ($stocks as $stock) {
            try {
                $this->info("\nFetching {$stock->symbol}...");
                
                $data = $this->alphaVantage->getDailyTimeSeries($stock->symbol, true);
                
                if ($data) {
                    $saved = $this->saveStockData($stock, $data);
                    $successCount++;
                    $this->info("✓ Saved {$saved} records for {$stock->symbol}");
                } else {
                    $errorCount++;
                    $this->warn("✗ Failed to fetch data for {$stock->symbol}");
                }
                
                $bar->advance();
                
                // Sleep to avoid rate limiting (Alpha Vantage: 5 calls/minute)
                sleep(13); // ~4.6 calls/minute
                
            } catch (\Exception $e) {
                $errorCount++;
                $this->error("Error fetching {$stock->symbol}: " . $e->getMessage());
                Log::error("Stock fetch error", [
                    'symbol' => $stock->symbol,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $bar->finish();
        
        $this->newLine(2);
        $this->info("✓ Completed!");
        $this->info("Success: {$successCount} stocks");
        $this->info("Errors: {$errorCount} stocks");

        return Command::SUCCESS;
    }

    private function saveStockData(Stock $stock, array $data): int
    {
        $savedCount = 0;

        foreach ($data['timestamps'] as $index => $date) {
            try {
                StockPrice::updateOrCreate(
                    [
                        'stock_id' => $stock->id,
                        'date' => $date,
                    ],
                    [
                        'open' => $data['open'][$index],
                        'high' => $data['high'][$index],
                        'low' => $data['low'][$index],
                        'close' => $data['close'][$index],
                        'volume' => $data['volume'][$index],
                    ]
                );
                $savedCount++;
            } catch (\Exception $e) {
                Log::error("Error saving stock price", [
                    'stock_id' => $stock->id,
                    'date' => $date,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $savedCount;
    }
}
