import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  CandlestickController,
  CandlestickElement,
  Title,
  Tooltip,
  Legend
);

interface CandlestickChartProps {
  symbol: string;
  timeframe?: '1D' | '1M' | '3M' | '1Y';
}

export default function CandlestickChart({ symbol, timeframe = '1M' }: CandlestickChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeframe]);

  const calculateMA = (data: number[], period: number): (number | null)[] => {
    const ma: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        ma.push(sum / period);
      }
    }
    return ma;
  };

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/stockdata/history/${symbol}`, {
        params: { days: 365 }
      });

      if (response.data.success && response.data.data) {
        let data = response.data.data;
        
        // Filter by timeframe
        const daysMap = { '1D': 1, '1M': 30, '3M': 90, '1Y': 365 };
        const daysToShow = daysMap[timeframe];
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
        
        const filteredIndices = data.timestamps
          .map((dateStr: string, index: number) => ({ dateStr, index }))
          .filter(({ dateStr }: { dateStr: string }) => new Date(dateStr) >= cutoffDate)
          .map(({ index }: { index: number }) => index);
        
        const timestamps = filteredIndices.map((i: number) => new Date(data.timestamps[i]));
        const open = filteredIndices.map((i: number) => data.open[i]);
        const high = filteredIndices.map((i: number) => data.high[i]);
        const low = filteredIndices.map((i: number) => data.low[i]);
        const close = filteredIndices.map((i: number) => data.close[i]);
        const volume = filteredIndices.map((i: number) => data.volume[i]);

        // Calculate Moving Averages
        const ma10 = calculateMA(close, 10);
        const ma20 = calculateMA(close, 20);

        // Prepare candlestick data
        const candlestickData = timestamps.map((t, i) => ({
          x: t.getTime(),
          o: open[i],
          h: high[i],
          l: low[i],
          c: close[i],
        }));

        setChartData({
          datasets: [
            {
              type: 'candlestick' as const,
              label: symbol,
              data: candlestickData,
              borderColor: {
                up: 'rgb(34, 197, 94)',
                down: 'rgb(239, 68, 68)',
                unchanged: 'rgb(156, 163, 175)',
              },
              backgroundColor: {
                up: 'rgba(34, 197, 94, 0.3)',
                down: 'rgba(239, 68, 68, 0.3)',
                unchanged: 'rgba(156, 163, 175, 0.3)',
              },
              borderWidth: 1,
            },
            {
              type: 'line' as const,
              label: 'MA(10)',
              data: timestamps.map((t, i) => ({ x: t.getTime(), y: ma10[i] })),
              borderColor: 'rgb(251, 146, 60)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4,
            },
            {
              type: 'line' as const,
              label: 'MA(20)',
              data: timestamps.map((t, i) => ({ x: t.getTime(), y: ma20[i] })),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4,
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            if (context.parsed.o !== undefined) {
              return [
                `${label}`,
                `O: ${context.parsed.o.toFixed(2)}`,
                `H: ${context.parsed.h.toFixed(2)}`,
                `L: ${context.parsed.l.toFixed(2)}`,
                `C: ${context.parsed.c.toFixed(2)}`,
              ];
            }
            return `${label}: ${context.parsed.y?.toFixed(2) || 'N/A'}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: timeframe === '1D' ? 'hour' : timeframe === '1M' ? 'day' : 'week',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
          },
        },
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

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg">
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
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="h-96">
      <Chart ref={chartRef} type="candlestick" data={chartData} options={options} />
    </div>
  );
}
