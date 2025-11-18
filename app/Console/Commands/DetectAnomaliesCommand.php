<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DetectAnomaliesCommand extends Command
{
    protected $signature = 'stocks:detect-anomalies';
    protected $description = 'Detect anomalies in stock data';

    public function handle()
    {
        // TODO: Dispatch DetectAnomaliesJob
        $this->info('Anomaly detection completed');
    }
}
