import { ChartOptions } from 'chart.js';

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#6b7280',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12,
        },
        padding: 15,
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#f9fafb',
      bodyColor: '#f9fafb',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      titleFont: {
        size: 13,
        weight: 'bold',
      },
      bodyFont: {
        size: 12,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        color: '#e5e7eb',
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: '#f3f4f6',
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
  },
};

export const chartColors = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  gray: '#6b7280',
};

export const formatVolume = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toString();
};

export const formatPrice = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
