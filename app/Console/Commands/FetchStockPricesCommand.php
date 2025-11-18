<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FetchStockPricesCommand extends Command
{
    protected $signature = 'stocks:fetch-prices';
    protected $description = 'Fetch stock prices from API';

    public function handle()
    {
        // TODO: Dispatch FetchStockPriceJob
        $this->info('Stock prices fetched successfully');
    }
}
