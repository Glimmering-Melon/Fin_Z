import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface WatchlistItem {
  id: number;
  stock_id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  added_at: string;
  volume?: number;
  high?: number;
  low?: number;
  target_price?: number;
  notes?: string;
}

type SortField = 'symbol' | 'price' | 'change_percent';

// Popular US stocks for autocomplete
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
];

export default function WatchlistWidget() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [sortField, setSortField] = useState<SortField>('change_percent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState(POPULAR_STOCKS);
  const [searchLoading, setSearchLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [compactView, setCompactView] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(() => fetchWatchlist(true), 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + R: Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchWatchlist(true);
      }
      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportToCSV();
      }
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [watchlist]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search stocks from API with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newSymbol.trim().length >= 1) {
      setSearchLoading(true);
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.get('/api/stocks/search', {
            params: { q: newSymbol }
          });
          
          if (response.data && response.data.length > 0) {
            setFilteredStocks(response.data);
          } else {
            // Fallback to local filter if API returns nothing
            const filtered = POPULAR_STOCKS.filter(
              (stock) =>
                stock.symbol.toLowerCase().includes(newSymbol.toLowerCase()) ||
                stock.name.toLowerCase().includes(newSymbol.toLowerCase())
            );
            setFilteredStocks(filtered);
          }
        } catch (error) {
          console.error('Search error:', error);
          // Fallback to local filter on error
          const filtered = POPULAR_STOCKS.filter(
            (stock) =>
              stock.symbol.toLowerCase().includes(newSymbol.toLowerCase()) ||
              stock.name.toLowerCase().includes(newSymbol.toLowerCase())
          );
          setFilteredStocks(filtered);
        } finally {
          setSearchLoading(false);
        }
      }, 300); // Debounce 300ms
    } else {
      setFilteredStocks(POPULAR_STOCKS);
      setSearchLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [newSymbol]);

  const fetchWatchlist = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const response = await axios.get('/api/user/watchlist');
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
      if (showRefresh) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim() || adding) return;

    setAdding(true);
    try {
      await axios.post('/api/user/watchlist', { symbol: newSymbol.toUpperCase() });
      setNewSymbol('');
      setShowSuggestions(false);
      await fetchWatchlist();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi thêm cổ phiếu');
    } finally {
      setAdding(false);
    }
  };

  const selectStock = (symbol: string) => {
    setNewSymbol(symbol);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const exportToCSV = () => {
    const headers = ['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Added Date'];
    const rows = watchlist.map(item => [
      item.symbol,
      item.name,
      item.price.toFixed(2),
      item.change.toFixed(2),
      item.change_percent.toFixed(2),
      new Date(item.added_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchlist_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const shareWatchlist = () => {
    const text = watchlist.map(item => 
      `${item.symbol}: $${item.price.toFixed(2)} (${item.change_percent >= 0 ? '+' : ''}${item.change_percent.toFixed(2)}%)`
    ).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My Watchlist',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Watchlist copied to clipboard!');
    }
  };

  const removeStock = async (id: number) => {
    if (removing) return;
    
    setRemoving(id);
    try {
      await axios.delete(`/api/user/watchlist/${id}`);
      await fetchWatchlist();
    } catch (error) {
      console.error('Error removing stock:', error);
      alert('Lỗi khi xóa cổ phiếu');
    } finally {
      setRemoving(null);
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

  const filteredWatchlist = watchlist.filter(item => {
    if (filter === 'gainers') return item.change >= 0;
    if (filter === 'losers') return item.change < 0;
    return true;
  });

  const sortedWatchlist = [...filteredWatchlist].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (a[sortField] < b[sortField]) return -1 * multiplier;
    if (a[sortField] > b[sortField]) return 1 * multiplier;
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 ml-3">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
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
                My Watchlist
                {refreshing && (
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </h2>
              <p className="text-zinc-400 text-sm">{watchlist.length} stocks • Real-time data</p>
            </div>
          </div>
          
          {/* Performance Summary */}
          {watchlist.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase">Avg Change</p>
                <p className={`text-lg font-bold ${
                  (watchlist.reduce((sum, item) => sum + item.change_percent, 0) / watchlist.length) >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}>
                  {((watchlist.reduce((sum, item) => sum + item.change_percent, 0) / watchlist.length)).toFixed(2)}%
                </p>
              </div>
              <div className="h-10 w-px bg-zinc-700"></div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase">Gainers</p>
                <p className="text-lg font-bold text-emerald-400">
                  {watchlist.filter(item => item.change >= 0).length}/{watchlist.length}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Search with autocomplete */}
        <form onSubmit={addStock} className="relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search stocks (e.g., AAPL, TSLA, MSFT...)"
                className="w-full px-4 py-3 pl-11 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-zinc-500 font-medium transition-all"
              />
              <svg className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {/* Autocomplete suggestions */}
              {showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 rounded-xl border border-zinc-700 max-h-64 overflow-y-auto z-50 shadow-2xl"
                >
                  {searchLoading ? (
                    <div className="px-4 py-6 text-center">
                      <div className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-zinc-400 mt-2">Searching...</p>
                    </div>
                  ) : filteredStocks.length > 0 ? (
                    filteredStocks.map((stock, index) => (
                      <button
                        key={`${stock.symbol}-${index}`}
                        type="button"
                        onClick={() => selectStock(stock.symbol)}
                        className="w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors border-b border-zinc-700/50 last:border-0 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{stock.symbol}</div>
                            <div className="text-sm text-zinc-400 truncate">{stock.name}</div>
                          </div>
                          <svg className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 ml-2 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-zinc-500">
                      <p className="text-sm">No results found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-bold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toolbar */}
      {watchlist.length > 0 && (
        <div className="px-6 py-3 bg-zinc-900/50 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all border border-zinc-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={shareWatchlist}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all border border-zinc-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <button
                onClick={() => fetchWatchlist(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all border border-zinc-700 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">View:</span>
              <button 
                onClick={() => setCompactView(false)}
                className={`p-1.5 rounded border transition-all ${
                  !compactView 
                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700' 
                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border-transparent hover:border-zinc-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button 
                onClick={() => setCompactView(true)}
                className={`p-1.5 rounded border transition-all ${
                  compactView 
                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700' 
                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border-transparent hover:border-zinc-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              All ({watchlist.length})
            </button>
            <button
              onClick={() => setFilter('gainers')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'gainers'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              Gainers ({watchlist.filter(item => item.change >= 0).length})
            </button>
            <button
              onClick={() => setFilter('losers')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === 'losers'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              Losers ({watchlist.filter(item => item.change < 0).length})
            </button>
          </div>
        </div>
      )}

      {/* Market Movers */}
      {watchlist.length > 0 && (
        <div className="px-6 py-4 bg-zinc-900/30 border-b border-zinc-800">
          <div className="grid grid-cols-3 gap-4">
            {/* Top Gainer */}
            {(() => {
              const topGainer = [...watchlist].sort((a, b) => b.change_percent - a.change_percent)[0];
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
              const topLoser = [...watchlist].sort((a, b) => a.change_percent - b.change_percent)[0];
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
              const mostActive = [...watchlist].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0];
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

      {/* Compact Grid View */}
      {compactView && sortedWatchlist.length > 0 ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedWatchlist.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-white font-bold text-xs">{item.symbol.substring(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{item.symbol}</div>
                    <div className="text-xs text-zinc-500 truncate max-w-[120px]">{item.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeStock(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-white mb-1">
                  ${item.price.toFixed(2)}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                  item.change >= 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.change >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                  </svg>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%)
                </div>
              </div>
              
              {/* Mini chart */}
              <div className="flex items-end gap-0.5 h-12 mb-3">
                {[...Array(20)].map((_, i) => {
                  const height = Math.random() * 100;
                  const isUp = item.change >= 0;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${
                        isUp ? 'bg-emerald-500/30' : 'bg-red-500/30'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Vol: {item.volume ? `${(item.volume / 1000000).toFixed(1)}M` : 'N/A'}</span>
                <span>{new Date(item.added_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
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
              <th className="px-6 py-4 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedWatchlist.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                      <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-white font-bold text-lg mb-2">
                      {filter === 'all' ? 'No stocks in watchlist' : `No ${filter} found`}
                    </p>
                    <p className="text-zinc-400 text-sm mb-6">
                      {filter === 'all' 
                        ? 'Add your favorite stocks to start tracking their performance'
                        : `Try changing the filter to see other stocks`
                      }
                    </p>
                    {filter === 'all' && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        <span className="text-xs text-zinc-500">Popular:</span>
                        {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'].map(symbol => (
                          <button
                            key={symbol}
                            onClick={() => {
                              setNewSymbol(symbol);
                              inputRef.current?.focus();
                            }}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-all border border-zinc-700 hover:border-emerald-500/50"
                          >
                            {symbol}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedWatchlist.map((item) => (
                <React.Fragment key={item.id}>
                  <tr 
                    className="hover:bg-zinc-800/50 transition-all duration-200 group"
                    style={{ opacity: removing === item.id ? 0.5 : 1 }}
                  >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <span className="text-white font-bold text-sm">{item.symbol.substring(0, 2)}</span>
                        </div>
                        {/* Performance Badge */}
                        {Math.abs(item.change_percent) > 5 && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            item.change_percent > 5 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}>
                            {item.change_percent > 5 ? '🔥' : '❄️'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white text-base">{item.symbol}</div>
                          {item.change_percent > 10 && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                              HOT
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-400">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Mini Sparkline Chart */}
                      <div className="flex items-end gap-0.5 h-8">
                        {[...Array(12)].map((_, i) => {
                          const height = Math.random() * 100;
                          const isUp = item.change >= 0;
                          return (
                            <div
                              key={i}
                              className={`w-1 rounded-t transition-all ${
                                isUp ? 'bg-emerald-500/40' : 'bg-red-500/40'
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white text-lg">
                          ${item.price.toFixed(2)}
                        </div>
                        {item.volume && (
                          <div className="text-xs text-zinc-500">
                            Vol: {(item.volume / 1000000).toFixed(1)}M
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex flex-col items-end px-3 py-2 rounded-lg ${
                      item.change >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      <div className={`font-bold text-base ${
                        item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                      </div>
                      <div className={`text-sm font-semibold ${
                        item.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick Actions */}
                      <button
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        className={`p-2 rounded-lg transition-all ${
                          expandedRow === item.id
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10'
                        }`}
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedRow === item.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const target = prompt(`Set price alert for ${item.symbol}:`, item.price.toFixed(2));
                          if (target) {
                            alert(`Alert set! You'll be notified when ${item.symbol} reaches $${target}`);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                        title="Set Alert"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeStock(item.id)}
                        disabled={removing === item.id}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove"
                      >
                        {removing === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === item.id && (
                  <tr className="bg-zinc-800/30">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                          <div className="text-xs text-zinc-500 mb-1">Open</div>
                          <div className="text-white font-semibold">${item.price.toFixed(2)}</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                          <div className="text-xs text-zinc-500 mb-1">High</div>
                          <div className="text-emerald-400 font-semibold">${(item.high || item.price * 1.02).toFixed(2)}</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                          <div className="text-xs text-zinc-500 mb-1">Low</div>
                          <div className="text-red-400 font-semibold">${(item.low || item.price * 0.98).toFixed(2)}</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                          <div className="text-xs text-zinc-500 mb-1">Volume</div>
                          <div className="text-white font-semibold">
                            {item.volume ? `${(item.volume / 1000000).toFixed(1)}M` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold transition-all border border-emerald-500/20">
                          Buy
                        </button>
                        <button className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold transition-all border border-red-500/20">
                          Sell
                        </button>
                        <button className="flex-1 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold transition-all border border-blue-500/20">
                          View Chart
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
