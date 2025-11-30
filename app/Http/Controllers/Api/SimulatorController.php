<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimulateRequest;
use App\Http\Requests\CompareStocksRequest;
use App\Services\SimulatorService;
use Illuminate\Http\JsonResponse;

class SimulatorController extends Controller
{
    public function __construct(
        private SimulatorService $simulator
    ) {}

    /**
     * Simulate investment for a single stock
     *
     * @param SimulateRequest $request
     * @return JsonResponse
     */
    public function simulate(SimulateRequest $request): JsonResponse
    {
        try {
            $result = $this->simulator->simulate(
                amount: $request->validated('amount'),
                symbol: $request->validated('symbol'),
                startDate: $request->validated('start_date'),
                endDate: $request->validated('end_date')
            );

            // Format response for frontend
            return response()->json([
                'symbol' => $result['stock']['symbol'],
                'initialInvestment' => $result['investment']['actual_amount'],
                'finalValue' => $result['returns']['current_value'],
                'profit' => $result['returns']['profit_loss'],
                'profitPercent' => $result['returns']['profit_loss_percentage'],
                'startDate' => $result['investment']['start_date'],
                'endDate' => $result['investment']['end_date'],
                'startPrice' => $result['prices']['start_price'],
                'endPrice' => $result['prices']['current_price'],
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Compare investment simulation for multiple stocks
     *
     * @param CompareStocksRequest $request
     * @return JsonResponse
     */
    public function compare(CompareStocksRequest $request): JsonResponse
    {
        try {
            $result = $this->simulator->compareMultiple(
                amount: $request->validated('amount'),
                symbols: $request->validated('symbols'),
                startDate: $request->validated('start_date')
            );

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Comparison completed successfully'
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get historical performance data for charting
     *
     * @param SimulateRequest $request
     * @return JsonResponse
     */
    public function performance(SimulateRequest $request): JsonResponse
    {
        try {
            // Calculate shares from amount and start price
            $simulationResult = $this->simulator->simulate(
                amount: $request->validated('amount'),
                symbol: $request->validated('symbol'),
                startDate: $request->validated('start_date')
            );

            $shares = $simulationResult['shares']['quantity'];

            $performance = $this->simulator->getHistoricalPerformance(
                symbol: $request->validated('symbol'),
                startDate: $request->validated('start_date'),
                shares: $shares
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'shares' => $shares,
                    'performance' => $performance
                ],
                'message' => 'Performance data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
