import React from 'react';
import { Alert } from '@/types';
import AlertBadge from './AlertBadge';
import { router } from '@inertiajs/react';

interface AlertsListProps {
  alerts: Alert[];
  onMarkAsRead?: (id: number) => void;
}

export default function AlertsList({ alerts, onMarkAsRead }: AlertsListProps) {
  const handleMarkAsRead = (id: number) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    } else {
      router.post(`/api/alerts/${id}/mark-as-read`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ['alerts'] });
        },
      });
    }
  };

  const getAlertIcon = (type: string) => {
    if (type === 'volume_spike') {
      return (
        <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  };

  const getAlertType = (type: string) => {
    return type === 'volume_spike' ? 'Volume Spike' : 'Price Jump';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-12 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="text-gray-400 text-lg">No alerts found</p>
        <p className="text-gray-500 text-sm mt-2">Alerts will appear here when anomalies are detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg border p-4 transition-all hover:shadow-lg ${
            alert.is_read
              ? 'border-gray-700 bg-gray-800/30 opacity-60'
              : 'border-purple-500/30 bg-gray-800/50'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getAlertIcon(alert.type)}
                {alert.stock && (
                  <span className="font-bold text-lg text-white">
                    {alert.stock.symbol}
                  </span>
                )}
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">{getAlertType(alert.type)}</span>
                <AlertBadge severity={alert.severity} />
                {!alert.is_read && (
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                )}
              </div>

              <p className="text-gray-300 mb-2">{alert.message}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Z-score: {alert.z_score.toFixed(2)}</span>
                <span>•</span>
                <span>{formatDate(alert.created_at)}</span>
                {alert.stock && (
                  <>
                    <span>•</span>
                    <span>{alert.stock.name}</span>
                  </>
                )}
              </div>
            </div>

            {!alert.is_read && (
              <button
                onClick={() => handleMarkAsRead(alert.id)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                Mark as Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
