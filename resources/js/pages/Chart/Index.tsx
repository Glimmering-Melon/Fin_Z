import { useState, useEffect } from 'react';
import MainLayout from '@/Components/MainLayout';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WatchlistStock {
  id: number;
  symbol: string;
  name: string;
}

interface ChartData {
  timestamps: string[];
  close: number[];
}

export default function ChartIndex() {
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [chartDatasets, setChartDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);

  const colors = [
    { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' }, // Blue
    { border: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)' }, // Green
    { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' }, // Red
    { border: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)' }, // Orange
    { border: 'rgb(139, 92, 246)', bg: 'rgba(139, 92, 246, 0.1)' }, // Purple
  ];

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (selectedStocks.length > 0) {
      fetchChartData();
    }
  }, [selectedStocks, timeframe]);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/user/watchlist');
      setWatchlistStocks(response.data);
      
      // Auto-select first 2 stocks
      if (response.data.length > 0) {
        setSelectedStocks([
          response.data[0].symbol,
          response.data.length > 1 ? response.data[1].symbol : null,
        ].filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const getDaysFromTimeframe = (tf: '1M' | '3M' | '6M' | '1Y'): number => {
    switch (tf) {
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 90;
    }
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const days = getDaysFromTimeframe(timeframe);
      const datasets: any[] = [];
      let commonLabels: string[] = [];

      for (let i = 0; i < selectedStocks.length; i++) {
        const symbol = selectedStocks[i];
        const response = await axios.get(`/api/stockdata/history/${symbol}?days=${days}`);
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          
          // Use first stock's timestamps as common labels
          if (i === 0) {
            commonLabels = data.timestamps.map((ts: string) => 
              new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            );
          }
          
          // Normalize prices to percentage change from start
          const startPrice = data.close[0];
          const normalizedPrices = data.close.map((price: number) => 
            ((price - startPrice) / startPrice) * 100
          );
          
          datasets.push({
            label: symbol,
            data: normalizedPrices,
            borderColor: colors[i % colors.length].border,
            backgroundColor: colors[i % colors.length].bg,
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          });
        }
      }

      setLabels(commonLabels);
      setChartDatasets(datasets);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else {
      if (selectedStocks.length < 5) {
        setSelectedStocks([...selectedStocks, symbol]);
      } else {
        alert('Tối đa 5 cổ phiếu');
      }
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Performance Comparison (% Change)',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Change (%)'
        }
      },
      x: {
        ticks: {
          maxTicksLimit: 10,
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
  };

  const chartData = {
    labels,
    datasets: chartDatasets,
  };

  if (watchlistStocks.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Compare Charts</h2>
          <p className="text-gray-600 mb-4">Watchlist trống</p>
          <a 
            href="/watchlist" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thêm cổ phiếu vào watchlist
          </a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Charts</h1>
          <p className="text-gray-600">So sánh hiệu suất của nhiều cổ phiếu</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {/* Stock Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn cổ phiếu để so sánh (tối đa 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {watchlistStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => toggleStock(stock.symbol)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedStocks.includes(stock.symbol)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {stock.symbol}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Đã chọn: {selectedStocks.length}/5
              </p>
            </div>

            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khung thời gian
              </label>
              <div className="flex gap-2">
                {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timeframe === tf
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading chart...</p>
              </div>
            </div>
          ) : selectedStocks.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-500">Chọn ít nhất 1 cổ phiếu để xem biểu đồ</p>
            </div>
          ) : (
            <div style={{ height: '500px' }}>
              <Line options={chartOptions} data={chartData} />
            </div>
          )}
        </div>

        {/* Stats */}
        {selectedStocks.length > 0 && chartDatasets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartDatasets.map((dataset, index) => {
              const lastValue = dataset.data[dataset.data.length - 1];
              const isPositive = lastValue >= 0;
              
              return (
                <div key={dataset.label} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">{dataset.label}</span>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: dataset.borderColor }}
                    ></div>
                  </div>
                  <div className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{lastValue.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {timeframe} performance
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
