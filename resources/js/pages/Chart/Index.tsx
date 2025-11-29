import { useState, useEffect } from 'react';
import MainLayout from '@/Components/MainLayout';
import CombinedChart from '@/Components/Charts/CombinedChart';
import CompareChart from '@/Components/Charts/CompareChart';
import StockSelector from '@/Components/StockSelector';

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD';
type ViewMode = 'single' | 'compare';

interface StockData {
  timestamps: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface StockCompareData {
  symbol: string;
  timestamps: string[];
  close: number[];
  volume: number[];
}

export default function Chart() {
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [symbol, setSymbol] = useState('VNM');
  const [compareSymbols, setCompareSymbols] = useState<string[]>(['VNM', 'VCB']);
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [data, setData] = useState<StockData | null>(null);
  const [compareData, setCompareData] = useState<StockCompareData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeframes: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', 'YTD'];

  const getDaysFromTimeframe = (tf: Timeframe): number => {
    switch (tf) {
      case '1D':
        return 1;
      case '5D':
        return 5;
      case '1M':
        return 30;
      case '3M':
        return 90;
      case '6M':
        return 180;
      case 'YTD':
        return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
      default:
        return 90;
    }
  };

  useEffect(() => {
    if (viewMode === 'single') {
      fetchData();
    }
  }, [symbol, timeframe, viewMode]);

  useEffect(() => {
    if (viewMode === 'compare') {
      fetchCompareData();
    }
  }, [timeframe, viewMode, compareSymbols]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = getDaysFromTimeframe(timeframe);
      const response = await fetch(`/api/stocks/${symbol}/history?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompareData = async () => {
    if (compareSymbols.length === 0) {
      setCompareData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const days = getDaysFromTimeframe(timeframe);
      const promises = compareSymbols.map(sym =>
        fetch(`/api/stocks/${sym}/history?days=${days}`)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${sym}`);
            return res.json();
          })
      );
      
      const results = await Promise.all(promises);
      const formattedData: StockCompareData[] = results.map((result, index) => ({
        symbol: compareSymbols[index],
        timestamps: result.data.timestamps,
        close: result.data.close,
        volume: result.data.volume,
      }));
      
      console.log('Compare data loaded:', formattedData);
      setCompareData(formattedData);
    } catch (err) {
      console.error('Error fetching compare data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCompareData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSymbol = formData.get('symbol') as string;
    if (newSymbol) {
      setSymbol(newSymbol.toUpperCase());
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with Title and Menu */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Biểu đồ kỹ thuật</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('single')}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'single'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Các chỉ báo
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'compare'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              So sánh
            </button>
          </div>
        </div>

        {/* Symbol Search or Selector based on view mode */}
        {viewMode === 'single' ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <form onSubmit={handleSymbolSubmit} className="flex gap-4">
              <input
                type="text"
                name="symbol"
                defaultValue={symbol}
                placeholder="Nhập mã cổ phiếu (VD: VNM, VCB, HPG)"
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tải
              </button>
            </form>
          </div>
        ) : (
          <StockSelector
            selectedSymbols={compareSymbols}
            onSymbolsChange={setCompareSymbols}
            maxSelections={3}
          />
        )}

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="text-gray-600">Đang tải dữ liệu...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Lỗi tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Chart */}
        {!loading && !error && viewMode === 'single' && data && (
          <CombinedChart data={data} symbol={symbol} />
        )}

        {/* Compare Chart */}
        {viewMode === 'compare' && !loading && !error && (
          <>
            {/* Debug info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
              <p className="text-blue-800">
                <strong>Debug:</strong> Đã chọn {compareSymbols.length} mã ({compareSymbols.join(', ')}), 
                Đã load {compareData.length} mã dữ liệu
              </p>
            </div>
            
            {compareData.length > 0 ? (
              <CompareChart data={compareData} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <p className="text-gray-600">Vui lòng chọn ít nhất 1 mã cổ phiếu để so sánh</p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
