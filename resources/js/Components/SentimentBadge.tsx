import React from 'react';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  // TODO: Color-coded badge (green/red/gray)
  return <span>{sentiment}</span>;
}
