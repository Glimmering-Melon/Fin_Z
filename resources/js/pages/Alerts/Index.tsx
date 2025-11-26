import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Alert, PaginatedResponse } from '@/types';
import AlertsList from '@/Components/AlertsList';
import AlertBadge from '@/Components/AlertBadge';

interface AlertsPageProps {
  alerts: PaginatedResponse<Alert>;
  filters: {
    severity?: string;
    symbol?: string;
    is_read?: string;
  };
  statistics: {
    total: number;
    unread: number;
    by_severity: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export default function AlertsIndex({ alerts, filters, statistics }: AlertsPageProps) {
  const [selectedSeverity, setSelectedSeverity] = useState(filters.severity || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.is_read || 'all');
  const [searchSymbol, setSearchSymbol] = useState(filters.symbol || '');

  const handleFilter = () => {
    const params: Record<string, string> = {};
    
    if (selectedSeverity !== 'all') params.severity = selectedSeverity;
    if (selectedStatus === 'unread') params.is_read = 'false';
    if (selectedStatus === 'read') params.is_read = 'true';
    if (searchSymbol) params.symbol = searchSymbol;

    router.get('/alerts', params, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSearchSymbol('');
    router.get('/alerts');
  };

  const handlePageChange = (url: string) => {
    router.get(url);
  };

  return (
    <>
      <Head title="Alerts - Anomaly Detection" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Anomaly Alerts
              </h1>
              <p className="text-gray-400">
                Real-time detection of volume spikes and price jumps
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Total Alerts</div>
              <div className="text-3xl font-bold text-white">{statistics.total}</div>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Unread</div>
              <div className="text-3xl font-bold text-blue-400">{statistics.unread}</div>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">High Severity</div>
              <div className="text-3xl font-bold text-red-400">{statistics.by_severity.high}</div>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-gray-800/50 p-4">
              <div className="text-sm text-gray-400 mb-1">Medium Severity</div>
              <div className="text-3xl font-bold text-yellow-400">{statistics.by_severity.medium}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={selectedSeverity}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSeverity(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={searchSymbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchSymbol(e.target.value)}
                  placeholder="e.g. VNM"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleFilter}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700"
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

          {/* Alerts List */}
          <AlertsList alerts={alerts.data} />

          {/* Pagination */}
          {alerts.meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {alerts.meta.from} to {alerts.meta.to} of {alerts.meta.total} alerts
              </div>
              <div className="flex gap-2">
                {alerts.links.prev && (
                  <button
                    onClick={() => handlePageChange(alerts.links.prev!)}
                    className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                  >
                    Previous
                  </button>
                )}
                <span className="flex items-center px-4 text-sm text-gray-400">
                  Page {alerts.meta.current_page} of {alerts.meta.last_page}
                </span>
                {alerts.links.next && (
                  <button
                    onClick={() => handlePageChange(alerts.links.next!)}
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
