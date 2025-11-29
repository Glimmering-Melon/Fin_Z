import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  symbol: string;
  timeframe?: '1D' | '1M' | '3M' | '1Y';
}

export default function StockChart({ symbol, timeframe = '1M' }: StockChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [volumeData, setVolumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeframe]);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      // For 1D, use intraday data from Alpha Vantage (real-time)
      if (timeframe === '1D') {
        response = await axios.get(`/api/alphavantage/intraday/${symbol}`, {
          params: { interval: '5min' }
        });
      } else {
        // For 1M, 3M, 1Y use database (fast & no API limits)
        response = await axios.get(`/api/stockdata/history/${symbol}`, {
          params: { days: 365 } // Get 1 year, filter client-side
        });
      }

      if (response.data.success && response.data.data) {
        let data = response.data.data;
        
        // Filter data based on timeframe
        const now = new Date();
        let daysToShow = 30; // Default 1M
        
        switch (timeframe) {
          case '1D':
            daysToShow = 1;
            break;
          case '1M':
            daysToShow = 30;
            break;
          case '3M':
            daysToShow = 90;
            break;
          case '1Y':
            daysToShow = 365;
            break;
        }
        
        // Filter data to show only requested timeframe
        if (timeframe !== '1D') {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
          
          const filteredIndices = data.timestamps
            .map((dateStr: string, index: number) => ({ dateStr, index }))
            .filter(({ dateStr }: { dateStr: string }) => new Date(dateStr) >= cutoffDate)
            .map(({ index }: { index: number }) => index);
          
          data = {
            timestamps: filteredIndices.map((i: number) => data.timestamps[i]),
            open: filteredIndices.map((i: number) => data.open[i]),
            high: filteredIndices.map((i: number) => data.high[i]),
            low: filteredIndices.map((i: number) => data.low[i]),
            close: filteredIndices.map((i: number) => data.close[i]),
            volume: filteredIndices.map((i: number) => data.volume[i]),
          };
        }
        
        // Format timestamps to dates
        const labels = data.timestamps.map((dateStr: string) => {
          const date = new Date(dateStr);
          if (timeframe === '1D') {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Price chart data
        setChartData({
          labels,
          datasets: [
            {
              label: symbol,
              data: data.close,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
          ],
        });

        // Volume chart data
        setVolumeData({
          labels,
          datasets: [
            {
              label: 'Volume',
              data: data.volume,
              backgroundColor: data.close.map((close: number, idx: number) => {
                if (idx === 0) return 'rgba(156, 163, 175, 0.5)';
                return close >= data.close[idx - 1]
                  ? 'rgba(34, 197, 94, 0.5)'
                  : 'rgba(239, 68, 68, 0.5)';
              }),
            },
          ],
        });
      } else {
        setError('No data available');
      }
    } catch (err: any) {
      console.error('Error fetching chart data:', err);
      setError(err.response?.data?.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const priceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(2)}M`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(2)}K`;
            }
            return value.toString();
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        position: 'right' as const,
        grid: {
          display: false,
        },
        ticks: {
          callback: function(value: any) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(0) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchChartData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Price Chart */}
      <div className="h-64 mb-4">
        <Line data={chartData} options={priceChartOptions} />
      </div>

      {/* Volume Chart */}
      {volumeData && (
        <div className="h-20">
          <Bar data={volumeData} options={volumeChartOptions} />
        </div>
      )}
    </div>
  );
}
