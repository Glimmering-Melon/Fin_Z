import React from 'react';
import { cn } from '@/lib/utils';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  score?: number;
  showScore?: boolean;
  className?: string;
}

export default function SentimentBadge({
  sentiment,
  score,
  showScore = false,
  className,
}: SentimentBadgeProps) {
  const sentimentConfig = {
    positive: {
      bg: 'bg-green-500',
      text: 'text-white',
      label: 'Positive',
      icon: '📈',
    },
    neutral: {
      bg: 'bg-gray-500',
      text: 'text-white',
      label: 'Neutral',
      icon: '➖',
    },
    negative: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: 'Negative',
      icon: '📉',
    },
  };

  const config = sentimentConfig[sentiment];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
      title={score ? `Score: ${score.toFixed(2)}` : undefined}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-90">({score.toFixed(2)})</span>
      )}
    </span>
  );
}
