import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LogicalRangeChangeEventHandler } from 'lightweight-charts';
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
  
  const [timeframe, setTimeframe] = useState<'ALL' | '1H' | '1D' | '1W' | '1M'>('ALL');
  const [loading, setLoading] = useState(true);
  const [allDatasets, setAllDatasets] = useState<{[key: string]: CandleData[]}>({});
  const [currentData, setCurrentData] = useState<CandleData[]>([]);

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
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeriesRef.current = volumeSeries;
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Listen to zoom changes
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleZoomChange);

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

  // Fetch all data when symbol changes
  useEffect(() => {
    fetchAllData();
  }, [symbol]);

  // Zoom to timeframe when timeframe changes
  useEffect(() => {
    if (currentData.length > 0) {
      zoomToTimeframe();
    }
  }, [timeframe]);

  const fetchAllData = async () => {
    setLoading(true);
    
    try {
      // Fetch data for ALL timeframes with appropriate resolutions
      const timeframes = ['1H', '1D', '1W', '1M', 'ALL'];
      const datasets: {[key: string]: CandleData[]} = {};
      
      for (const tf of timeframes) {
        const response = await axios.get(`/api/stocks/${symbol}/candles`, {
          params: { timeframe: tf, limit: 5000 }
        });
        datasets[tf] = response.data;
      }
      
      setAllDatasets(datasets);
      
      // Start with ALL view
      const allData = datasets['ALL'];
      setCurrentData(allData);
      setTimeframe('ALL');
      
      // Update chart
      if (candleSeriesRef.current && allData.length > 0) {
        const candleData = allData.map(d => ({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
        candleSeriesRef.current.setData(candleData);
      }

      if (volumeSeriesRef.current && allData.length > 0) {
        const volumeData = allData.map(d => ({
          time: d.time as any,
          value: d.volume,
          color: d.close >= d.open ? '#10b98180' : '#ef444480',
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      chartRef.current?.timeScale().fitContent();
      
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const zoomToTimeframe = () => {
    if (!chartRef.current || !allDatasets[timeframe]) return;

    // Switch to the dataset for this timeframe (different resolution)
    const data = allDatasets[timeframe];
    setCurrentData(data);
    
    // Update chart with new resolution data
    if (candleSeriesRef.current && data.length > 0) {
      const candleData = data.map(d => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candleSeriesRef.current.setData(candleData);
    }

    if (volumeSeriesRef.current && data.length > 0) {
      const volumeData = data.map(d => ({
        time: d.time as any,
        value: d.volume,
        color: d.close >= d.open ? '#10b98180' : '#ef444480',
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    // Fit content to show all data
    chartRef.current.timeScale().fitContent();
  };

  const handleZoomChange: LogicalRangeChangeEventHandler = (logicalRange) => {
    // Optional: Auto-detect timeframe based on zoom level
    // For now, we let user control timeframe manually
  };

  const handleTimeframeClick = (tf: typeof timeframe) => {
    setTimeframe(tf);
  };

  const timeframeOptions = [
    { value: 'ALL' as const, label: 'ALL', desc: 'All History' },
    { value: '1M' as const, label: '1M', desc: 'Monthly' },
    { value: '1W' as const, label: '1W', desc: 'Weekly' },
    { value: '1D' as const, label: '1D', desc: 'Daily' },
    { value: '1H' as const, label: '1H', desc: 'Hourly' },
  ];

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{symbol}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            {timeframe === 'ALL' && 'All Historical Data • Scroll to explore'}
            {timeframe === '1H' && 'Zoomed to Last 1 Hour • Scroll left for history'}
            {timeframe === '1D' && 'Zoomed to Last 1 Day • Scroll left for history'}
            {timeframe === '1W' && 'Zoomed to Last 1 Week • Scroll left for history'}
            {timeframe === '1M' && 'Zoomed to Last 1 Month • Scroll left for history'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 mr-2">Zoom:</span>
          {timeframeOptions.map((tf) => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeClick(tf.value)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                timeframe === tf.value
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              } disabled:opacity-50`}
              title={tf.desc}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-zinc-950">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-sm text-zinc-400">Loading all timeframes...</p>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} />
      </div>

      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>Bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Bearish</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Volume</span>
          </div>
          <div className="ml-auto text-zinc-600">
            {currentData.length} candles • Daily resolution
          </div>
        </div>
      </div>
    </div>
  );
}
