<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FetchStockNewsCommand extends Command
{
    protected $signature = 'stocks:fetch-news';
    protected $description = 'Fetch stock news from RSS/API';

    public function handle()
    {
        // TODO: Dispatch FetchStockNewsJob
        $this->info('Stock news fetched successfully');
    }
}
