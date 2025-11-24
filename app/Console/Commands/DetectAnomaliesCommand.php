<?php

namespace App\Console\Commands;

use App\Jobs\DetectAnomaliesJob;
use Illuminate\Console\Command;

class DetectAnomaliesCommand extends Command
{
    protected $signature = 'stocks:detect-anomalies';
    protected $description = 'Detect anomalies in stock data (volume spikes and price jumps)';

    public function handle()
    {
        $this->info('Starting anomaly detection...');

        DetectAnomaliesJob::dispatch();

        $this->info('Anomaly detection job dispatched successfully');
        
        return Command::SUCCESS;
    }
}
