import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import axios from 'axios';

interface CandlestickChartProps {
  symbol: string;
  height?: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function CandlestickChart({ symbol, height = 500 }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  
  const [timeframe, setTimeframe] = useState<'ALL' | '1H' | '1D' | '1W' | '1M'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showMA, setShowMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#18181b' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#3f3f46',
      },
      rightPriceScale: {
        borderColor: '#3f3f46',
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeriesRef.current = volumeSeries;
    
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  // Fetch data when symbol or timeframe changes
  useEffect(() => {
    fetchData();
  }, [symbol, timeframe]);

  // Update indicators when toggled
  useEffect(() => {
    if (!loading) {
      updateIndicators();
    }
  }, [showMA, showEMA]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/stocks/${symbol}/candles`, {
        params: { timeframe, limit: 1000 }
      });

      const data: CandleData[] = response.data;

      if (!data || data.length === 0) {
        setError('No data available');
        return;
      }

      // Update candlestick data
      if (candleSeriesRef.current) {
        const candleData = data.map(d => ({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
        candleSeriesRef.current.setData(candleData);
      }

      // Update volume data
      if (volumeSeriesRef.current) {
        const volumeData = data.map(d => ({
          time: d.time as any,
          value: d.volume,
          color: d.close >= d.open ? '#10b98180' : '#ef444480',
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      // Update indicators
      updateIndicators(data);

      // Fit content
      chartRef.current?.timeScale().fitContent();
      
    } catch (err: any) {
      console.error('Error fetching candlestick data:', err);
      setError(err.response?.data?.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const updateIndicators = (data?: CandleData[]) => {
    if (!chartRef.current) return;

    // Clear old indicators
    if (maSeriesRef.current) {
      chartRef.current.removeSeries(maSeriesRef.current);
      maSeriesRef.current = null;
    }
    if (emaSeriesRef.current) {
      chartRef.current.removeSeries(emaSeriesRef.current);
      emaSeriesRef.current = null;
    }

    // Get current data if not provided
    if (!data && candleSeriesRef.current) {
      // We need to refetch or store data
      return;
    }

    if (!data || data.length === 0) return;

    // Add MA if enabled
    if (showMA) {
      const ma = calculateMA(data, 20);
      if (ma.length > 0) {
        maSeriesRef.current = chartRef.current.addLineSeries({
          color: '#f59e0b',
          lineWidth: 2,
          title: 'MA(20)',
        });
        maSeriesRef.current.setData(ma);
      }
    }

    // Add EMA if enabled
    if (showEMA) {
      const ema = calculateEMA(data, 20);
      if (ema.length > 0) {
        emaSeriesRef.current = chartRef.current.addLineSeries({
          color: '#8b5cf6',
          lineWidth: 2,
          title: 'EMA(20)',
        });
        emaSeriesRef.current.setData(ema);
      }
    }
  };

  const calculateMA = (data: CandleData[], period: number) => {
    const ma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      ma.push({ time: data[i].time as any, value: sum / period });
    }
    return ma;
  };

  const calculateEMA = (data: CandleData[], period: number) => {
    if (data.length === 0) return [];
    
    const k = 2 / (period + 1);
    const ema = [{ time: data[0].time as any, value: data[0].close }];
    
    for (let i = 1; i < data.length; i++) {
      const value = data[i].close * k + ema[i - 1].value * (1 - k);
      ema.push({ time: data[i].time as any, value });
    }
    return ema;
  };

  const timeframeOptions = [
    { value: 'ALL' as const, label: 'ALL', tooltip: 'All History' },
    { value: '1H' as const, label: '1H', tooltip: 'Last 1 Hour' },
    { value: '1D' as const, label: '1D', tooltip: 'Last 1 Day' },
    { value: '1W' as const, label: '1W', tooltip: 'Last 1 Week' },
    { value: '1M' as const, label: '1M', tooltip: 'Last 1 Month' },
  ];

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{symbol}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            {timeframe === '1H' && 'Last 1 Hour (1-min candles)'}
            {timeframe === '1D' && 'Last 1 Day (5-min candles)'}
            {timeframe === '1W' && 'Last 1 Week (hourly)'}
            {timeframe === '1M' && 'Last 1 Month (daily)'}
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 mr-2">Interval:</span>
          {timeframeOptions.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                timeframe === tf.value
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={tf.tooltip}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-4">
        <span className="text-sm text-zinc-500 font-medium">Technical Indicators:</span>
        
        <button
          onClick={() => setShowMA(!showMA)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showMA
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/20'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          MA(20)
        </button>
        
        <button
          onClick={() => setShowEMA(!showEMA)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showEMA
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg shadow-purple-500/20'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          EMA(20)
        </button>

        {showMA && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-0.5 bg-amber-500"></div>
            <span className="text-xs text-amber-400">Moving Average</span>
          </div>
        )}
        
        {showEMA && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-0.5 bg-purple-500"></div>
            <span className="text-xs text-purple-400">Exponential MA</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative bg-zinc-950">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm text-zinc-400">Loading chart data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
              <p className="text-red-400 text-center">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <div ref={chartContainerRef} />
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>Bullish (Up)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Bearish (Down)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Volume</span>
          </div>
          <div className="ml-auto text-zinc-600">
            Powered by lightweight-charts
          </div>
        </div>
      </div>
    </div>
  );
}
