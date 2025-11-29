import { useEffect, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export default function TopStocksWidget() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async (type: 'gainers' | 'losers') => {
    setLoading(true);
    try {
      const endpoint = type === 'gainers' ? '/api/market/top-gainers' : '/api/market/top-losers';
      const response = await axios.get(endpoint);
      setStocks(response.data.stocks);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks(activeTab);
  }, [activeTab]);

  const handleStockClick = (symbol: string) => {
    router.visit(`/chart?symbol=${symbol}`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`;
    }
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`;
    }
    return vol.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'gainers'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'losers'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Top Losers
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
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
            No data available
          </div>
        ) : (
          <div className="space-y-1">
            {stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
              const bgHoverClass = 'hover:bg-gray-50';

              return (
                <div
                  key={stock.id}
                  onClick={() => handleStockClick(stock.symbol)}
                  className={`flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer transition-colors ${bgHoverClass}`}
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

                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatNumber(stock.price)}
                    </p>
                    <p className={`text-xs font-medium ${colorClass}`}>
                      {isPositive ? '+' : ''}{formatNumber(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
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
