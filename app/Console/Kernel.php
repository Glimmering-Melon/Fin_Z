<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // TODO: Schedule jobs
        // $schedule->command('stocks:fetch-prices')->hourly();
        // $schedule->command('stocks:fetch-news')->hourly();
        // $schedule->command('stocks:detect-anomalies')->daily();
        // $schedule->command('logs:cleanup')->weekly();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
