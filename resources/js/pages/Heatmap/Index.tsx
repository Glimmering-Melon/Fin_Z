import { useState, useEffect } from 'react';
import MainLayout from '@/Components/MainLayout';
import axios from 'axios';

interface HeatmapStock {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  price: number;
  volume: number;
  change: number;
  marketCap: number;
}

export default function Heatmap() {
  const [stocks, setStocks] = useState<HeatmapStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStock, setHoveredStock] = useState<HeatmapStock | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      const response = await axios.get('/api/heatmap');
      console.log('Heatmap data:', response.data);
      setStocks(response.data.data);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (change: number): string => {
    if (change > 5) return 'bg-green-600';
    if (change > 2) return 'bg-green-500';
    if (change > 0) return 'bg-green-400';
    if (change === 0) return 'bg-gray-500';
    if (change > -2) return 'bg-red-400';
    if (change > -5) return 'bg-red-500';
    return 'bg-red-600';
  };

  const getTextColor = (change: number): string => {
    return Math.abs(change) > 1 ? 'text-white' : 'text-gray-800';
  };

  // Calculate sizes based on market cap
  const totalMarketCap = stocks.reduce((sum, stock) => sum + stock.marketCap, 0);
  const getSize = (stock: HeatmapStock) => {
    if (totalMarketCap === 0) return 100 / stocks.length;
    return (stock.marketCap / totalMarketCap) * 100;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading heatmap...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (stocks.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Heatmap</h2>
          <p className="text-gray-600 mb-4">Watchlist trống</p>
          <a 
            href="/watchlist" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thêm cổ phiếu vào watchlist
          </a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Market Heatmap</h1>
              <p className="text-gray-600 mt-1">
                Hiển thị {stocks.length} cổ phiếu từ watchlist của bạn
              </p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Thay đổi:</span>
              <div className="flex items-center gap-1">
                <div className="w-8 h-4 bg-red-600 rounded"></div>
                <span className="text-xs text-gray-600">-5%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-4 bg-gray-500 rounded"></div>
                <span className="text-xs text-gray-600">0%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-4 bg-green-600 rounded"></div>
                <span className="text-xs text-gray-600">+5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-4 gap-2" style={{ minHeight: '600px' }}>
            {stocks.map((stock) => {
              const size = getSize(stock);
              const isLarge = size > 15;
              const isMedium = size > 8;
              
              return (
                <div
                  key={stock.symbol}
                  className={`${getColor(stock.change)} ${getTextColor(stock.change)} rounded-lg p-4 cursor-pointer transition-opacity hover:opacity-90 relative`}
                  style={{
                    gridColumn: isLarge ? 'span 2' : 'span 1',
                    gridRow: isLarge ? 'span 2' : isMedium ? 'span 2' : 'span 1',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredStock(stock);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({ 
                      x: rect.left + rect.width / 2, 
                      y: rect.top - 10 
                    });
                  }}
                  onMouseLeave={() => setHoveredStock(null)}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="font-bold text-lg">{stock.symbol}</div>
                      {isLarge && (
                        <div className="text-sm opacity-90 mt-1">{stock.name}</div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xl font-bold">
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </div>
                      {isMedium && (
                        <div className="text-sm opacity-90 mt-1">
                          ${stock.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Floating Tooltip */}
          {hoveredStock && (
            <div 
              className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl p-4 pointer-events-none"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translate(-50%, -100%)',
                minWidth: '250px',
              }}
            >
              <div className="font-bold text-lg mb-2">{hoveredStock.symbol}</div>
              <div className="text-sm space-y-1">
                <div className="text-gray-300">{hoveredStock.name}</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="font-semibold">${hoveredStock.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Change:</span>
                  <span className={`font-semibold ${hoveredStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {hoveredStock.change >= 0 ? '+' : ''}{hoveredStock.change.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume:</span>
                  <span className="font-semibold">{(hoveredStock.volume / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sector:</span>
                  <span className="font-semibold">{hoveredStock.sector}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Gainers</div>
            <div className="text-3xl font-bold text-green-600">
              {stocks.filter(s => s.change > 0).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Avg: +{(stocks.filter(s => s.change > 0).reduce((sum, s) => sum + s.change, 0) / stocks.filter(s => s.change > 0).length || 0).toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Unchanged</div>
            <div className="text-3xl font-bold text-gray-600">
              {stocks.filter(s => s.change === 0).length}
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Losers</div>
            <div className="text-3xl font-bold text-red-600">
              {stocks.filter(s => s.change < 0).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Avg: {(stocks.filter(s => s.change < 0).reduce((sum, s) => sum + s.change, 0) / stocks.filter(s => s.change < 0).length || 0).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
