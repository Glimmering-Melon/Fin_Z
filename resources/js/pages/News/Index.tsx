import { useState } from 'react';
import { router } from '@inertiajs/react';
import MainLayout from '@/Components/MainLayout';

interface NewsItem {
  id: string | number;
  title: string;
  summary: string;
  url: string;
  image: string | null;
  source: string;
  published_at: string;
  category: string;
  symbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
}

interface WatchlistStock {
  symbol: string;
  name: string;
}

interface NewsPageProps {
  news: NewsItem[];
  watchlistStocks: WatchlistStock[];
}

export default function NewsIndex({ news: initialNews, watchlistStocks: initialWatchlistStocks }: NewsPageProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>(initialWatchlistStocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredNews = news.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSentiment = selectedSentiment === 'all' || item.sentiment === selectedSentiment;
    const matchesStock = selectedStock === 'all' || item.symbols.includes(selectedStock);
    
    return matchesSearch && matchesSentiment && matchesStock;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➖';
    }
  };

  const sentimentCounts = {
    positive: news.filter(n => n.sentiment === 'positive').length,
    negative: news.filter(n => n.sentiment === 'negative').length,
    neutral: news.filter(n => n.sentiment === 'neutral').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Fetching fresh news data...');
      
      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      // Call fresh news API endpoint
      const response = await fetch('/api/news/fresh', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fresh data received:', data);
      
      // Update state with fresh data
      setNews(data.news || []);
      setWatchlistStocks(data.watchlistStocks || []);
      
      console.log('News updated successfully');
      
    } catch (error) {
      console.error('Error refreshing news:', error);
      
      // Fallback to page reload if API fails
      console.log('Falling back to page reload...');
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Market News</h1>
              <p className="text-gray-600 mt-1">
                News from your watchlist stocks
                {watchlistStocks.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({watchlistStocks.length} stocks: {watchlistStocks.map(s => s.symbol).join(', ')})
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/watchlist"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Watchlist</span>
              </a>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg 
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{news.length}</div>
                <div className="text-sm text-gray-600">Articles</div>
              </div>
            </div>
          </div>
          
          {/* Sentiment Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Positive</span>
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{sentimentCounts.positive}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Neutral</span>
                <span className="text-2xl">➖</span>
              </div>
              <div className="text-2xl font-bold text-gray-600">{sentimentCounts.neutral}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Negative</span>
                <span className="text-2xl">📉</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{sentimentCounts.negative}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Sentiment Filter */}
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">📈 Positive</option>
              <option value="neutral">➖ Neutral</option>
              <option value="negative">📉 Negative</option>
            </select>
            
            {/* Stock Filter */}
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stocks</option>
              {watchlistStocks.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
            {watchlistStocks.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-4">You don't have any stocks in your watchlist yet.</p>
                <a
                  href="/watchlist"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stocks to Watchlist
                </a>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">
                  No recent news for your watchlist stocks. Try refreshing or check back later.
                </p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh News
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {item.image && (
                  <div className="aspect-video overflow-hidden bg-gray-200">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Multiple stock symbols */}
                      {item.symbols.map((symbol) => (
                        <span key={symbol} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          {symbol}
                        </span>
                      ))}
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentIcon(item.sentiment)} {item.sentiment}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.published_at)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {item.source}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.summary}
                  </p>
                  
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    Read more
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
