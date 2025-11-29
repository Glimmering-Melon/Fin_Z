import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface MarketIndex {
  index: string;
  value: number;
  change: number;
  percentChange: number;
  volume: number;
  lastUpdated: string;
}

interface MarketOverviewWidgetProps {
  data: MarketIndex[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function MarketOverviewWidget({
  data,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: MarketOverviewWidgetProps) {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(refreshInterval / 1000);

  useEffect(() => {
    if (!autoRefresh) return;

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          return refreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto refresh
    const refreshTimer = setInterval(() => {
      router.reload({ only: ['marketOverview'] });
    }, refreshInterval);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(refreshTimer);
    };
  }, [autoRefresh, refreshInterval]);

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getChangeBgColor = (change: number): string => {
    if (change > 0) return 'bg-green-500/10 border-green-500/20';
    if (change < 0) return 'bg-red-500/10 border-red-500/20';
    return 'bg-yellow-500/10 border-yellow-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Market Overview</h2>
        {autoRefresh && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh in {timeUntilRefresh}s</span>
          </div>
        )}
      </div>

      {/* Market Indices Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.map((market) => (
          <div
            key={market.index}
            className={`rounded-lg border p-4 transition-colors ${getChangeBgColor(market.change)}`}
          >
            {/* Index Name */}
            <div className="mb-3 text-sm font-medium text-gray-400">{market.index}</div>

            {/* Index Value */}
            <div className="mb-2 text-2xl font-bold text-white">
              {market.value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            {/* Change & Percent Change */}
            <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${getChangeColor(market.change)}`}>
              {market.change > 0 ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : market.change < 0 ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>
                {market.change > 0 ? '+' : ''}
                {market.change.toFixed(2)} ({market.percentChange > 0 ? '+' : ''}
                {market.percentChange.toFixed(2)}%)
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-3 text-xs">
              <span className="text-gray-400">Volume</span>
              <span className="font-medium text-gray-300">{formatVolume(market.volume)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
