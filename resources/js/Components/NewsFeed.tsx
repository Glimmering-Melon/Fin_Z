import React from 'react';
import { News } from '@/types';
import SentimentBadge from './SentimentBadge';

interface NewsFeedProps {
  news: News[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (news.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
        <div className="text-4xl mb-2">📰</div>
        <p className="text-gray-400">No news found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <article
          key={item.id}
          className="rounded-lg border border-gray-700 bg-gray-800/50 p-5 transition-all hover:border-purple-500/50 hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="flex-1 text-lg font-semibold text-white hover:text-purple-400 transition-colors">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.title}
              </a>
            </h3>
            <SentimentBadge
              sentiment={item.sentiment}
              score={item.sentiment_score}
              showScore
            />
          </div>

          <p className="text-gray-400 mb-3 leading-relaxed">
            {truncateText(item.content)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-gray-400">{item.source}</span>
              <span>•</span>
              <span>{formatDate(item.published_at)}</span>
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Read more
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
