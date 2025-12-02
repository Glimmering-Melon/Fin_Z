import { useState } from 'react';
import { Head } from '@inertiajs/react';
import CandlestickChart from '@/Components/Charts/CandlestickChartFinal';

export default function ChartTest() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'];

  return (
    <>
      <Head title="Chart Test" />
      
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Candlestick Chart Test
            </h1>
            <p className="text-zinc-400">
              Testing Chart-5 implementation with OHLC, Volume, and Technical Indicators
            </p>
          </div>

          {/* Stock Selector */}
          <div className="mb-6 bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Select Stock:
            </label>
            <div className="flex gap-3">
              {stocks.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedSymbol === symbol
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <CandlestickChart symbol={selectedSymbol} height={600} />

          {/* Info */}
          <div className="mt-6 bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Features Implemented:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400">
              <div>
                <p className="mb-2">✅ OHLC Candlestick display</p>
                <p className="mb-2">✅ Volume histogram</p>
                <p className="mb-2">✅ Multiple timeframes (1H, 1D, 1W, 1M)</p>
              </div>
              <div>
                <p className="mb-2">✅ Moving Average (MA 20)</p>
                <p className="mb-2">✅ Exponential Moving Average (EMA 20)</p>
                <p className="mb-2">✅ Interactive zoom & pan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
