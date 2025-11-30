import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

interface SimulatorWidgetProps {
  defaultSymbol?: string;
}

export default function SimulatorWidget({ defaultSymbol = 'AAPL' }: SimulatorWidgetProps) {
  const [formData, setFormData] = useState({
    symbol: defaultSymbol,
    amount: '',
    start_date: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlistStocks, setWatchlistStocks] = useState<string[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  // Load watchlist on mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoadingWatchlist(true);
    try {
      const response = await axios.get('/api/user/watchlist');
      const data = response.data.success ? response.data.data : response.data;
      
      if (Array.isArray(data) && data.length > 0) {
        const symbols = data.map((item: any) => item.symbol);
        setWatchlistStocks(symbols);
        
        // Set first watchlist stock as default if current symbol not in list
        if (!symbols.includes(formData.symbol)) {
          setFormData({ ...formData, symbol: symbols[0] });
        }
      } else {
        // Fallback to popular stocks if watchlist is empty
        setWatchlistStocks(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META']);
      }
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      // Fallback to popular stocks
      setWatchlistStocks(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META']);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/simulator/simulate', {
        symbol: formData.symbol,
        amount: parseFloat(formData.amount),
        start_date: formData.start_date,
      });

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      symbol: defaultSymbol,
      amount: '',
      start_date: '',
    });
    setResult(null);
    setError(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What-If Simulator</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Stock {watchlistStocks.length > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">(từ Watchlist)</span>}
          </label>
          <select
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || loadingWatchlist}
          >
            {loadingWatchlist ? (
              <option value="">Đang tải...</option>
            ) : watchlistStocks.length === 0 ? (
              <option value="">Chưa có mã trong watchlist</option>
            ) : (
              watchlistStocks.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))
            )}
          </select>
          {watchlistStocks.length === 0 && !loadingWatchlist && (
            <p className="text-xs text-gray-500 mt-1">
              <a href="/watchlist" className="text-blue-600 hover:text-blue-700">
                Thêm mã vào watchlist →
              </a>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Investment Amount ($)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Calculating...' : 'Run Simulation'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Results</h4>
            
            {/* Investment Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Invested</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(result.investment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(result.returns.current_value)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Shares</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {result.shares.quantity.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Days Held</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {result.investment.days_held}
                  </p>
                </div>
              </div>
            </div>

            {/* Profit/Loss */}
            <div className={`rounded-lg p-4 ${
              result.returns.profit_loss >= 0 
                ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit/Loss</p>
              <p className={`text-2xl font-bold ${
                result.returns.profit_loss >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {result.returns.profit_loss >= 0 ? '+' : ''}
                {formatCurrency(result.returns.profit_loss)}
              </p>
              <p className={`text-sm font-medium ${
                result.returns.profit_loss >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {result.returns.profit_loss >= 0 ? '+' : ''}
                {result.returns.profit_loss_percent.toFixed(2)}%
              </p>
            </div>

            {/* Additional Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Buy Price</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(result.shares.buy_price)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Current Price</p>
                <p className="font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(result.shares.current_price)}
                </p>
              </div>
              <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Annualized Return</p>
                <p className={`font-bold text-lg ${
                  result.returns.annualized_return >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.returns.annualized_return >= 0 ? '+' : ''}
                  {result.returns.annualized_return.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
