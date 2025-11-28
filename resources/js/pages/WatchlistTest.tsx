import React, { useState } from 'react';
import WatchlistWidget from '@/Components/WatchlistWidget';

export default function WatchlistTest() {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Watchlist Feature</h1>
                <p className="text-sm text-gray-500">Test Environment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Guide Card */}
        {showGuide && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Quick Start Guide</h3>
                    <p className="text-blue-100 text-sm">Test all features below</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">➕</span>
                    <span className="font-semibold">Add Stock</span>
                  </div>
                  <p className="text-sm text-blue-100">Enter symbol (VNM, VIC, HPG, VHM, FPT)</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🗑️</span>
                    <span className="font-semibold">Remove Stock</span>
                  </div>
                  <p className="text-sm text-blue-100">Click Remove button on any stock</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔄</span>
                    <span className="font-semibold">Sort Data</span>
                  </div>
                  <p className="text-sm text-blue-100">Click column headers to sort</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-semibold">Real-time</span>
                  </div>
                  <p className="text-sm text-blue-100">Auto-refresh every 30 seconds</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Watchlist Widget */}
          <div className="lg:col-span-2">
            <WatchlistWidget />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Available Stocks
              </h3>
              <div className="space-y-2">
                {['VNM', 'VIC', 'HPG', 'VHM', 'FPT'].map((symbol) => (
                  <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-mono font-semibold text-gray-900">{symbol}</span>
                    <span className="text-xs text-gray-500">Available</span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Info Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API Endpoints
              </h3>
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">GET</span>
                    <code className="text-xs text-green-300">/api/user/watchlist</code>
                  </div>
                  <p className="text-xs text-gray-400">Lấy danh sách</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">POST</span>
                    <code className="text-xs text-blue-300">/api/user/watchlist</code>
                  </div>
                  <p className="text-xs text-gray-400">Thêm stock</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">DEL</span>
                    <code className="text-xs text-red-300">/api/user/watchlist/:id</code>
                  </div>
                  <p className="text-xs text-gray-400">Xóa stock</p>
                </div>
              </div>
            </div>

            {/* Feature Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Status</h3>
              <div className="space-y-3">
                {[
                  { name: 'Add/Remove', status: 'Active' },
                  { name: 'Real-time Updates', status: 'Active' },
                  { name: 'Sorting', status: 'Active' },
                  { name: 'Price Display', status: 'Active' },
                ].map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{feature.name}</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {feature.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
