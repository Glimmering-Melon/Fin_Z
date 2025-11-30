import { useState, useEffect } from 'react';
import MainLayout from '@/Components/MainLayout';
import StockQuote from '@/Components/Dashboard/StockQuote';
import CombinedChart from '@/Components/Charts/CombinedChart';

interface DashboardProps {
  initialData?: {
    indices: {
      vnindex: any;
      hnx: any;
      upcom: any;
    };
  };
}

interface ChartData {
  timestamps: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface WatchlistStock {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface Anomaly {
  stock_id: number;
  symbol: string;
  type: 'volume' | 'price';
  value: number;
  mean: number;
  std_dev: number;
  z_score: number;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1M' | '3M' | '1Y'>('1M');
  const [quoteData, setQuoteData] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'volume' | 'price'>('all');

  const timeframes: Array<'1D' | '1M' | '3M' | '1Y'> = ['1D', '1M', '3M', '1Y'];

  const getDaysFromTimeframe = (tf: '1D' | '1M' | '3M' | '1Y'): number => {
    switch (tf) {
      case '1D': return 1;
      case '1M': return 30;
      case '3M': return 90;
      case '1Y': return 365;
      default: return 30;
    }
  };

  useEffect(() => {
    fetchWatchlist();
    fetchAnomalies();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchChartData();
    }
  }, [selectedSymbol, selectedTimeframe]);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/user/watchlist');
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }
      const data = await response.json();
      setWatchlistStocks(data);
      
      // Auto-select first stock if available
      if (data.length > 0 && !selectedSymbol) {
        setSelectedSymbol(data[0].symbol);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const fetchAnomalies = async () => {
    try {
      const response = await fetch('/api/anomalies');
      if (!response.ok) {
        throw new Error('Failed to fetch anomalies');
      }
      const data = await response.json();
      setAnomalies(data.anomalies || []);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    }
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const days = getDaysFromTimeframe(selectedTimeframe);
      
      // Use StockData API (database + fallback to Alpha Vantage)
      const response = await fetch(`/api/stockdata/history/${selectedSymbol}?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      
      const result = await response.json();
      console.log('Chart data response:', result);
      
      if (result.success && result.data && result.data.timestamps && result.data.timestamps.length > 0) {
        setChartData(result.data);
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Selector - From Watchlist */}
          <div className="bg-white rounded-lg shadow p-4">
            {watchlistStocks.length > 0 ? (
              <div className="flex items-center space-x-2 overflow-x-auto">
                {watchlistStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedSymbol === stock.symbol
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold">{stock.symbol}</div>
                      <div className={`text-xs ${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">Watchlist trống</p>
                <a href="/watchlist" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Thêm cổ phiếu vào watchlist →
                </a>
              </div>
            )}
          </div>

          {/* Stock Quote Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <StockQuote 
              symbol={selectedSymbol} 
              onDataLoaded={setQuoteData}
            />
          </div>

          {/* Chart Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Technical Analysis</h3>
              <div className="flex space-x-2">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      selectedTimeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
                </div>
              </div>
            ) : chartData ? (
              <CombinedChart data={chartData} symbol={selectedSymbol} />
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No chart data available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Finnhub API may not have historical data for this symbol
                  </p>
                  <button
                    onClick={fetchChartData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Heatmap Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Thị trường</h3>
              <a href="/heatmap" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </a>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {/* Sample heatmap tiles */}
              <div className="bg-green-500 text-white p-4 rounded text-center">
                <div className="font-bold">SHB</div>
                <div className="text-sm">+3.47%</div>
              </div>
              <div className="bg-red-500 text-white p-4 rounded text-center">
                <div className="font-bold">SSI</div>
                <div className="text-sm">-1.33%</div>
              </div>
              <div className="bg-yellow-500 text-white p-4 rounded text-center">
                <div className="font-bold">VIX</div>
                <div className="text-sm">+0%</div>
              </div>
              <div className="bg-green-600 text-white p-4 rounded text-center">
                <div className="font-bold">MBB</div>
                <div className="text-sm">+1.86%</div>
              </div>
              <div className="bg-green-500 text-white p-4 rounded text-center">
                <div className="font-bold">CTG</div>
                <div className="text-sm">+3.97%</div>
              </div>
              <div className="bg-green-600 text-white p-4 rounded text-center">
                <div className="font-bold">TPB</div>
                <div className="text-sm">+2.83%</div>
              </div>
              <div className="bg-green-500 text-white p-4 rounded text-center">
                <div className="font-bold">STB</div>
                <div className="text-sm">+0.19%</div>
              </div>
              <div className="bg-green-600 text-white p-4 rounded text-center">
                <div className="font-bold">ACB</div>
                <div className="text-sm">+1.54%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Simulator & Alerts */}
        <div className="space-y-6">
          {/* What-If Simulator */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">What-If Simulator</h3>
              <a href="/simulator" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem đầy đủ →
              </a>
            </div>
            
            {watchlistStocks.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Mô phỏng đầu tư với {watchlistStocks.length} cổ phiếu trong watchlist
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Cổ phiếu theo dõi</span>
                    <span className="text-lg font-bold text-blue-600">{watchlistStocks.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {watchlistStocks.slice(0, 6).map((stock) => (
                      <span key={stock.symbol} className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                        {stock.symbol}
                      </span>
                    ))}
                    {watchlistStocks.length > 6 && (
                      <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-500">
                        +{watchlistStocks.length - 6}
                      </span>
                    )}
                  </div>
                </div>

                <a 
                  href="/simulator"
                  className="block w-full px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 text-center"
                >
                  Mở Simulator
                </a>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">Thêm cổ phiếu vào watchlist để sử dụng simulator</p>
                <a 
                  href="/watchlist"
                  className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Thêm cổ phiếu
                </a>
              </div>
            )}
          </div>

          {/* Alerts / Anomaly Detection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Anomaly Detection</h3>
              <button
                onClick={fetchAnomalies}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
            
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={() => setAnomalyFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  anomalyFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setAnomalyFilter('volume')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  anomalyFilter === 'volume' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Volume
              </button>
              <button 
                onClick={() => setAnomalyFilter('price')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  anomalyFilter === 'price' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Price
              </button>
            </div>

            <div className="space-y-3">
              {anomalies
                .filter(anomaly => anomalyFilter === 'all' || anomaly.type === anomalyFilter)
                .slice(0, 5)
                .map((anomaly, index) => {
                  const getSeverityColor = (zScore: number) => {
                    const absZ = Math.abs(zScore);
                    if (absZ >= 3) return { bg: 'bg-red-50', dot: 'bg-red-500', badge: 'bg-red-500', label: 'HIGH' };
                    if (absZ >= 2) return { bg: 'bg-yellow-50', dot: 'bg-yellow-500', badge: 'bg-yellow-500', label: 'MEDIUM' };
                    return { bg: 'bg-gray-50', dot: 'bg-gray-400', badge: 'bg-gray-400', label: 'LOW' };
                  };
                  
                  const colors = getSeverityColor(anomaly.z_score);
                  
                  return (
                    <div key={index} className={`flex items-start space-x-3 p-3 ${colors.bg} rounded-lg`}>
                      <div className={`w-2 h-2 rounded-full ${colors.dot} mt-2 flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {anomaly.symbol}: {anomaly.message}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Z-Score: {anomaly.z_score.toFixed(2)} | 
                          {anomaly.type === 'volume' 
                            ? ` Volume: ${anomaly.value.toLocaleString()}` 
                            : ` Change: ${anomaly.value.toFixed(2)}%`
                          }
                        </p>
                      </div>
                      <span className={`px-2 py-1 ${colors.badge} text-white text-xs font-medium rounded flex-shrink-0`}>
                        {colors.label}
                      </span>
                    </div>
                  );
                })}
              
              {anomalies.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">No anomalies detected</p>
                  <p className="text-gray-400 text-xs mt-1">Your watchlist stocks are trading normally</p>
                </div>
              )}
              
              {anomalies.filter(a => anomalyFilter === 'all' || a.type === anomalyFilter).length === 0 && anomalies.length > 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No {anomalyFilter} anomalies</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
