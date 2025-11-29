import { useEffect, useState } from 'react';
import axios from 'axios';

interface StockQuoteProps {
  symbol: string;
  onDataLoaded?: (data: any) => void;
}

export default function StockQuote({ symbol, onDataLoaded }: StockQuoteProps) {
  const [quote, setQuote] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  const fetchData = async () => {
    try {
      // Fetch quote and profile in parallel
      const [quoteRes, profileRes] = await Promise.all([
        axios.get(`/api/finnhub/quote/${symbol}`),
        axios.get(`/api/finnhub/profile/${symbol}`),
      ]);

      if (quoteRes.data.success) {
        setQuote(quoteRes.data.data);
        if (onDataLoaded) {
          onDataLoaded(quoteRes.data.data);
        }
      }

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-red-600">
        Failed to load stock data
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded">
              {profile?.exchange || 'US'}
            </span>
            <span className="text-sm text-gray-500">
              {profile?.currency || 'USD'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {profile?.name || symbol}
          </h2>
          <p className="text-sm text-gray-500">{symbol}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold text-gray-900">
            ${quote.current.toFixed(2)}
          </span>
          <span className={`text-lg font-semibold ${changeColor} flex items-center`}>
            {isPositive ? '▲' : '▼'}
            {isPositive ? '+' : ''}{quote.change.toFixed(2)} 
            ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Updated: {new Date(quote.timestamp * 1000).toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Open</p>
          <p className="font-semibold text-gray-900">${quote.open.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">High</p>
          <p className="font-semibold text-green-600">${quote.high.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Low</p>
          <p className="font-semibold text-red-600">${quote.low.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Prev Close</p>
          <p className="font-semibold text-gray-900">${quote.previousClose.toFixed(2)}</p>
        </div>
      </div>

      {profile && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Market Cap</p>
              <p className="font-semibold text-gray-900">
                ${(profile.marketCapitalization || 0).toLocaleString()}M
              </p>
            </div>
            <div>
              <p className="text-gray-500">Industry</p>
              <p className="font-semibold text-gray-900">
                {profile.finnhubIndustry || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
