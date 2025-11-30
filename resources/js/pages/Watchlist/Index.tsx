import { useState, useEffect } from 'react';
import MainLayout from '@/Components/MainLayout';
import axios from 'axios';

interface Stock {
  id?: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
}

interface StockOption {
  symbol: string;
  name: string;
  sector?: string;
}

type SortField = 'symbol' | 'price' | 'change_percent';

export default function WatchlistIndex() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('change_percent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockOption[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allStocks, setAllStocks] = useState<StockOption[]>([]);

  useEffect(() => {
    fetchStocks();
    fetchAllStocks();
    const interval = setInterval(() => fetchStocks(true), 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    ).slice(0, 10);

    setSearchResults(filtered);
  }, [searchQuery, allStocks]);

  const fetchAllStocks = async () => {
    try {
      const response = await axios.get('/api/stocks');
      if (response.data.success) {
        setAllStocks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching all stocks:', error);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    try {
      const response = await axios.post('/api/user/watchlist', { symbol });
      console.log('Add to watchlist response:', response.data);
      
      // API returns 201 status on success
      if (response.status === 201 || response.data.message) {
        setSearchQuery('');
        setShowSearchResults(false);
        fetchStocks(); // Refresh watchlist
      }
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      if (error.response?.status === 409) {
        alert('Mã này đã có trong watchlist');
      } else {
        alert('Lỗi khi thêm vào watchlist');
      }
    }
  };

  const removeFromWatchlist = async (id: number) => {
    try {
      const response = await axios.delete(`/api/user/watchlist/${id}`);
      console.log('Remove from watchlist response:', response.data);
      
      if (response.status === 200 || response.data.message) {
        fetchStocks(); // Refresh watchlist
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert('Lỗi khi xóa khỏi watchlist');
    }
  };

  const fetchStocks = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      // Step 1: Get user's watchlist
      const watchlistResponse = await axios.get('/api/user/watchlist');
      console.log('Watchlist response:', watchlistResponse.data);
      
      // API returns array directly, not wrapped in data
      const watchlistItems = Array.isArray(watchlistResponse.data) 
        ? watchlistResponse.data 
        : (watchlistResponse.data.data || []);
      
      if (watchlistItems.length === 0) {
        setStocks([]);
        setLoading(false);
        if (showRefresh) {
          setTimeout(() => setRefreshing(false), 500);
        }
        return;
      }
      
      // Step 2: Map watchlist items to stock format
      // API already returns price data, no need to fetch again
      const stocksData = watchlistItems.map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: item.price || 0,
        change: item.change || 0,
        change_percent: item.change_percent || 0,
        high: item.high || item.price || 0,
        low: item.low || item.price || 0,
        open: item.open || item.price || 0,
        volume: item.volume || 0,
      }));
      
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
      if (showRefresh) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredStocks = stocks.filter(item => {
    if (filter === 'gainers') return item.change >= 0;
    if (filter === 'losers') return item.change < 0;
    return true;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (a[sortField] < b[sortField]) return -1 * multiplier;
    if (a[sortField] > b[sortField]) return 1 * multiplier;
    return 0;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-zinc-400 ml-3">Loading market data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Market Watchlist
                  {refreshing && (
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h2>
                <p className="text-zinc-400 text-sm">{stocks.length} stocks • Real-time data</p>
              </div>
            </div>
            
            {/* Performance Summary */}
            {stocks.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase">Avg Change</p>
                  <p className={`text-lg font-bold ${
                    (stocks.reduce((sum, item) => sum + item.change_percent, 0) / stocks.length) >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {((stocks.reduce((sum, item) => sum + item.change_percent, 0) / stocks.length)).toFixed(2)}%
                  </p>
                </div>
                <div className="h-10 w-px bg-zinc-700"></div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase">Gainers</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {stocks.filter(item => item.change >= 0).length}/{stocks.length}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Box */}
          <div className="mb-4 relative search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Tìm và thêm mã cổ phiếu vào watchlist..."
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-b-0"
                  >
                    <div className="flex-1 px-4 py-3">
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-sm text-zinc-400">{stock.name}</div>
                    </div>
                    <div className="flex items-center gap-2 px-4">
                      {stock.sector && (
                        <div className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded">
                          {stock.sector}
                        </div>
                      )}
                      <button
                        onClick={() => addToWatchlist(stock.symbol)}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1"
                        title="Thêm vào watchlist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs font-medium">Thêm</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-4 text-center text-zinc-400">
                Không tìm thấy mã "{searchQuery}"
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                All ({stocks.length})
              </button>
              <button
                onClick={() => setFilter('gainers')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'gainers'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                Gainers ({stocks.filter(item => item.change >= 0).length})
              </button>
              <button
                onClick={() => setFilter('losers')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'losers'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                Losers ({stocks.filter(item => item.change < 0).length})
              </button>
            </div>
            
            <button
              onClick={() => fetchStocks(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all border border-zinc-700 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Market Movers */}
        {stocks.length > 0 && (
          <div className="px-6 py-4 bg-zinc-900/30 border-b border-zinc-800">
            <div className="grid grid-cols-3 gap-4">
              {/* Top Gainer */}
              {(() => {
                const topGainer = [...stocks].sort((a, b) => b.change_percent - a.change_percent)[0];
                return topGainer && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-xs font-semibold text-emerald-400 uppercase">Top Gainer</span>
                    </div>
                    <div className="font-bold text-white">{topGainer.symbol}</div>
                    <div className="text-emerald-400 text-sm font-semibold">+{topGainer.change_percent.toFixed(2)}%</div>
                  </div>
                );
              })()}
              
              {/* Top Loser */}
              {(() => {
                const topLoser = [...stocks].sort((a, b) => a.change_percent - b.change_percent)[0];
                return topLoser && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      <span className="text-xs font-semibold text-red-400 uppercase">Top Loser</span>
                    </div>
                    <div className="font-bold text-white">{topLoser.symbol}</div>
                    <div className="text-red-400 text-sm font-semibold">{topLoser.change_percent.toFixed(2)}%</div>
                  </div>
                );
              })()}
              
              {/* Most Active */}
              {(() => {
                const mostActive = [...stocks].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0];
                return mostActive && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-400 uppercase">Most Active</span>
                    </div>
                    <div className="font-bold text-white">{mostActive.symbol}</div>
                    <div className="text-blue-400 text-sm font-semibold">
                      {mostActive.volume ? `${(mostActive.volume / 1000000).toFixed(1)}M` : 'N/A'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-800 transition-colors group"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    <span>Stock</span>
                    {sortField === 'symbol' && (
                      <span className="text-emerald-400 text-sm">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-800 transition-colors group"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Price</span>
                    {sortField === 'price' && (
                      <span className="text-emerald-400 text-sm">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-800 transition-colors group"
                  onClick={() => handleSort('change_percent')}
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Change</span>
                    {sortField === 'change_percent' && (
                      <span className="text-emerald-400 text-sm">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <div>
                        <p className="text-zinc-400 text-lg font-medium mb-1">Watchlist trống</p>
                        <p className="text-zinc-500 text-sm">Tìm kiếm và thêm mã cổ phiếu để theo dõi</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-zinc-800/50 transition-all duration-200 group">
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <span className="text-white font-bold text-sm">{stock.symbol.substring(0, 2)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-base">{stock.symbol}</div>
                          <div className="text-sm text-zinc-400">{stock.name}</div>
                        </div>
                        <button
                          onClick={() => stock.id && removeFromWatchlist(stock.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          title="Xóa khỏi watchlist"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-white text-lg">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        H: ${stock.high?.toFixed(2)} L: ${stock.low?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Bar Chart */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`text-sm font-semibold ${
                              stock.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                            </div>
                          </div>
                          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`absolute top-0 h-full rounded-full transition-all ${
                                stock.change_percent >= 0 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 left-0' 
                                  : 'bg-gradient-to-r from-red-500 to-red-400 right-0'
                              }`}
                              style={{ 
                                width: `${Math.min(Math.abs(stock.change_percent) * 10, 100)}%`,
                                [stock.change_percent >= 0 ? 'left' : 'right']: 0
                              }}
                            />
                          </div>
                        </div>
                        {/* Change Value */}
                        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          stock.change >= 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
