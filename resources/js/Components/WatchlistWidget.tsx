import { useEffect, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface WatchlistStock {
  id: number;
  stock_id: number;
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export default function WatchlistWidget() {
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'symbol' | 'changePercent'>('changePercent');

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/user/watchlist');
      setStocks(response.data.watchlist);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRemove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/user/watchlist/${id}`);
      setStocks(stocks.filter(stock => stock.id !== id));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const handleStockClick = (symbol: string) => {
    router.visit(`/chart?symbol=${symbol}`);
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortBy === 'symbol') {
      return a.symbol.localeCompare(b.symbol);
    }
    return b.changePercent - a.changePercent;
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Watchlist</h3>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-500">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'symbol' | 'changePercent')}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="changePercent">% Change</option>
              <option value="symbol">Symbol</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Your watchlist is empty</p>
            <p className="text-sm">Search for stocks to add them to your watchlist</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedStocks.map((stock) => {
              const isPositive = stock.change >= 0;
              const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

              return (
                <div
                  key={stock.id}
                  onClick={() => handleStockClick(stock.symbol)}
                  className="flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-gray-900">{stock.symbol}</p>
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                        {stock.exchange}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(stock.price)}
                      </p>
                      <p className={`text-xs font-medium ${colorClass}`}>
                        {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleRemove(stock.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      title="Remove from watchlist"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
