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
    return type === 'volume_spike' ? '📊' : '📈';
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
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center">
        <div className="text-4xl mb-2">🔔</div>
        <p className="text-gray-400">No alerts found</p>
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
                <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                {alert.stock && (
                  <span className="font-bold text-lg text-white">
                    {alert.stock.symbol}
                  </span>
                )}
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
