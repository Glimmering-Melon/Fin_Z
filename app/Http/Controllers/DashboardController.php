<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\SharesFakeUserData;
use App\Services\StockApiService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    use SharesFakeUserData;

    private StockApiService $stockApiService;

    public function __construct(StockApiService $stockApiService)
    {
        $this->stockApiService = $stockApiService;
    }

    public function index()
    {
        $marketOverview = $this->stockApiService->fetchMarketOverview();

        return Inertia::render('Dashboard/Index', array_merge(
            $this->getFakeUserData(),
            [
                'marketOverview' => $marketOverview,
            ]
        ));
    }
}
