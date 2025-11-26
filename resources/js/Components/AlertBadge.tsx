import React from 'react';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  severity: 'low' | 'medium' | 'high';
  className?: string;
}

export default function AlertBadge({ severity, className }: AlertBadgeProps) {
  const severityConfig = {
    high: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: 'HIGH',
    },
    medium: {
      bg: 'bg-yellow-500',
      text: 'text-white',
      label: 'MEDIUM',
    },
    low: {
      bg: 'bg-blue-500',
      text: 'text-white',
      label: 'LOW',
    },
  };

  const config = severityConfig[severity];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
