<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Fetch daily stock data after market close (6 PM EST = 6 AM Vietnam time next day)
        $schedule->command('stock:fetch-daily')
            ->dailyAt('06:00')
            ->timezone('Asia/Ho_Chi_Minh')
            ->appendOutputTo(storage_path('logs/stock-fetch.log'));
        
        // TODO: Additional scheduled jobs
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
