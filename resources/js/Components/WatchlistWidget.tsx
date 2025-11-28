import React, { useState, useEffect } from 'react';
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
}

type SortField = 'symbol' | 'price' | 'change_percent';

export default function WatchlistWidget() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [sortField, setSortField] = useState<SortField>('change_percent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/user/watchlist');
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    try {
      await axios.post('/api/user/watchlist', { symbol: newSymbol.toUpperCase() });
      setNewSymbol('');
      fetchWatchlist();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error adding stock');
    }
  };

  const removeStock = async (id: number) => {
    try {
      await axios.delete(`/api/user/watchlist/${id}`);
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing stock:', error);
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

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (a[sortField] < b[sortField]) return -1 * multiplier;
    if (a[sortField] > b[sortField]) return 1 * multiplier;
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Watchlist</h2>
              <p className="text-blue-100 text-sm">{watchlist.length} stocks tracked</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={addStock} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Enter symbol (e.g., VNM)"
              className="w-full px-4 py-3 bg-white/95 backdrop-blur border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-2">
                  Symbol 
                  <span className="text-blue-600">
                    {sortField === 'symbol' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-2">
                  Price
                  <span className="text-blue-600">
                    {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                onClick={() => handleSort('change_percent')}
              >
                <div className="flex items-center justify-end gap-2">
                  Change
                  <span className="text-blue-600">
                    {sortField === 'change_percent' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedWatchlist.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">No stocks in watchlist</p>
                      <p className="text-gray-500 text-sm mt-1">Add your first stock to get started!</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedWatchlist.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-blue-50 transition-colors group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {item.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{item.symbol}</div>
                        <div className="text-xs text-gray-500">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-gray-900 text-lg">
                      {item.price.toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex flex-col items-end px-3 py-2 rounded-lg ${
                      item.change >= 0 
                        ? 'bg-green-50' 
                        : 'bg-red-50'
                    }`}>
                      <div className={`font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                      </div>
                      <div className={`text-sm font-semibold ${item.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change_percent >= 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeStock(item.id)}
                      className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 border border-red-200 hover:border-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
