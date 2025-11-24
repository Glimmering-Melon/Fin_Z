import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { News, PaginatedResponse } from '@/types';
import NewsFeed from '@/Components/NewsFeed';
import SentimentBadge from '@/Components/SentimentBadge';

interface NewsPageProps {
  news: PaginatedResponse<News>;
  filters: {
    sentiment?: string;
    min_score?: string;
    keyword?: string;
    source?: string;
  };
  statistics: {
    total: number;
    by_sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    recent: number;
  };
  sources: string[];
}

export default function NewsIndex({ news, filters, statistics, sources }: NewsPageProps) {
  const [selectedSentiment, setSelectedSentiment] = useState(filters.sentiment || 'all');
  const [minScore, setMinScore] = useState(filters.min_score || '');
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const [selectedSource, setSelectedSource] = useState(filters.source || 'all');

  const handleFilter = () => {
    const params: Record<string, string> = {};
    
    if (selectedSentiment !== 'all') params.sentiment = selectedSentiment;
    if (minScore) params.min_score = minScore;
    if (keyword) params.keyword = keyword;
    if (selectedSource !== 'all') params.source = selectedSource;

    router.get('/news', params, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSelectedSentiment('all');
    setMinScore('');
    setKeyword('');
    setSelectedSource('all');
    router.get('/news');
  };

  const handlePageChange = (url: string) => {
    router.get(url);
  };

  return (
    <>
      <Head title="News Feed - Sentiment Analysis" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              📰 News Feed
            </h1>
            <p className="text-gray-400">
              Financial news with AI-powered sentiment analysis
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Total News</div>
              <div className="text-3xl font-bold text-white">{statistics.total}</div>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Positive</div>
              <div className="text-3xl font-bold text-green-400">{statistics.by_sentiment.positive}</div>
            </div>
            <div className="rounded-lg border border-gray-500/30 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Neutral</div>
              <div className="text-3xl font-bold text-gray-400">{statistics.by_sentiment.neutral}</div>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Negative</div>
              <div className="text-3xl font-bold text-red-400">{statistics.by_sentiment.negative}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sentiment
                </label>
                <select
                  value={selectedSentiment}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSentiment(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={minScore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinScore(e.target.value)}
                  placeholder="0.0 - 1.0"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSource(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Sources</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Keyword
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleFilter}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply
                </button>
                <button
                  onClick={handleClearFilters}
                  className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                setSelectedSentiment('positive');
                setMinScore('0.7');
                handleFilter();
              }}
              className="rounded-full border border-green-500/50 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              📈 Highly Positive
            </button>
            <button
              onClick={() => {
                setSelectedSentiment('negative');
                setMinScore('0.7');
                handleFilter();
              }}
              className="rounded-full border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              📉 Highly Negative
            </button>
            <button
              onClick={() => {
                setKeyword('market');
                handleFilter();
              }}
              className="rounded-full border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
            >
              🏢 Market News
            </button>
          </div>

          {/* News Feed */}
          <NewsFeed news={news.data} />

          {/* Pagination */}
          {news.meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {news.meta.from} to {news.meta.to} of {news.meta.total} articles
              </div>
              <div className="flex gap-2">
                {news.links.prev && (
                  <button
                    onClick={() => handlePageChange(news.links.prev!)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                  >
                    Previous
                  </button>
                )}
                <span className="flex items-center px-4 text-sm text-gray-400">
                  Page {news.meta.current_page} of {news.meta.last_page}
                </span>
                {news.links.next && (
                  <button
                    onClick={() => handlePageChange(news.links.next!)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
