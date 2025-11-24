<?php

namespace App\Console\Commands;

use App\Jobs\FetchStockNewsJob;
use Illuminate\Console\Command;

class FetchStockNewsCommand extends Command
{
    protected $signature = 'stocks:fetch-news';
    protected $description = 'Fetch stock news from RSS/API and analyze sentiment';

    public function handle()
    {
        $this->info('Starting to fetch stock news...');

        FetchStockNewsJob::dispatch();

        $this->info('Stock news fetch job dispatched successfully');
        
        return Command::SUCCESS;
    }
}

