import { useState } from 'react';
import MainLayout from '@/Components/MainLayout';
import StockQuote from '@/Components/Dashboard/StockQuote';
import CandlestickChart from '@/Components/Charts/CandlestickChart';
import WatchlistWidget from '@/Components/WatchlistWidget';

interface DashboardProps {
  initialData?: {
    indices: {
      vnindex: any;
      hnx: any;
      upcom: any;
    };
  };
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1M' | '3M' | '1Y'>('1M');
  const [quoteData, setQuoteData] = useState<any>(null);

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'META', name: 'Meta' },
  ];

  const timeframes: Array<'1D' | '1M' | '3M' | '1Y'> = ['1D', '1M', '3M', '1Y'];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Selector */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedSymbol === stock.symbol
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Quote Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <StockQuote 
              symbol={selectedSymbol} 
              onDataLoaded={setQuoteData}
            />
          </div>

          {/* Candlestick Chart */}
          <CandlestickChart symbol={selectedSymbol} height={500} />

          {/* Watchlist Widget */}
          <WatchlistWidget />

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
            <h3 className="text-lg font-bold text-gray-900 mb-4">What-If Simulator</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Stock</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select...</option>
                  <option>VNM</option>
                  <option>VIC</option>
                  <option>HPG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select End Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount</label>
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="w-full px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600">
                Run Simulation
              </button>

              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                Reset
              </button>
            </div>
          </div>

          {/* Alerts / Anomaly Detection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Alerts / Anomaly Detection</h3>
            
            <div className="flex space-x-2 mb-4">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded">All</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">High Priority</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">Volume Spike</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">Price Jump</button>
            </div>

            <div className="space-y-3">
              {/* Alert Item */}
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">TSLA: Volume Spike detected (300% above average)</p>
                  <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">High</span>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">TSLA: Price Jump (+500% after news)</p>
                  <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">Medium</span>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">GOOG: Price Jump +15% on news release</p>
                  <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
