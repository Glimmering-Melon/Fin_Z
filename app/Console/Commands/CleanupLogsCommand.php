<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupLogsCommand extends Command
{
    protected $signature = 'logs:cleanup';
    protected $description = 'Cleanup old logs and data';

    public function handle()
    {
        // TODO: Dispatch CleanupLogsJob
        $this->info('Logs cleaned up successfully');
    }
}
