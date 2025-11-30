import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { chartColors, defaultChartOptions, formatDate, formatPrice, formatVolume } from '@/utils/chartConfig';
import SummaryTable from './SummaryTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartData {
  timestamps: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface CombinedChartProps {
  data: ChartData;
  symbol: string;
}

// Calculate SMA (Simple Moving Average)
const calculateSMA = (data: number[], period: number): (number | null)[] => {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

// Calculate Bollinger Bands
const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2) => {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i]!;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }
  
  return { upper, middle: sma, lower };
};

// Calculate RSI (Relative Strength Index)
const calculateRSI = (data: number[], period: number = 14): (number | null)[] => {
  const rsi: (number | null)[] = [null];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
    
    if (i < period) {
      rsi.push(null);
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return rsi;
};

// Calculate MACD
const calculateMACD = (data: number[]) => {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdLine = ema12.map((val, i) => val !== null && ema26[i] !== null ? val - ema26[i]! : null);
  const signalLine = calculateEMA(macdLine.filter(v => v !== null) as number[], 9);
  
  // Pad signal line with nulls to match length
  const paddedSignal: (number | null)[] = new Array(macdLine.length - signalLine.length).fill(null).concat(signalLine);
  
  const histogram = macdLine.map((val, i) => 
    val !== null && paddedSignal[i] !== null ? val - paddedSignal[i]! : null
  );
  
  return { macd: macdLine, signal: paddedSignal, histogram };
};

// Calculate EMA (Exponential Moving Average)
const calculateEMA = (data: number[], period: number): (number | null)[] => {
  const ema: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      ema.push(sum / period);
    } else {
      const prevEma = ema[i - 1]!;
      ema.push((data[i] - prevEma) * multiplier + prevEma);
    }
  }
  
  return ema;
};

export default function CombinedChart({ data, symbol }: CombinedChartProps) {
  // Calculate technical indicators
  const volumeSMA9 = calculateSMA(data.volume, 9);
  const bollingerBands = calculateBollingerBands(data.close, 20, 2);
  const rsi14 = calculateRSI(data.close, 14);
  const rsiSMA14 = calculateSMA(rsi14.filter(v => v !== null) as number[], 14);
  const macdData = calculateMACD(data.close);
  
  // Determine volume bar colors based on price change
  const volumeColors = data.close.map((close, index) => {
    if (index === 0) return chartColors.gray;
    return close >= data.close[index - 1] ? chartColors.success : chartColors.danger;
  });

  const chartData = {
    labels: data.timestamps.map((date) => formatDate(date)),
    datasets: [
      // Price Line
      {
        type: 'line' as const,
        label: `${symbol} Giá`,
        data: data.close,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartColors.primary,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        yAxisID: 'y',
        order: 1,
      },
      // Bollinger Bands - Upper
      {
        type: 'line' as const,
        label: 'BB Trên',
        data: bollingerBands.upper,
        borderColor: 'rgba(147, 51, 234, 0.5)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
        order: 3,
      },
      // Bollinger Bands - Middle (SMA 20)
      {
        type: 'line' as const,
        label: 'BB Giữa (MA)',
        data: bollingerBands.middle,
        borderColor: 'rgba(147, 51, 234, 0.8)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
        order: 2,
      },
      // Bollinger Bands - Lower
      {
        type: 'line' as const,
        label: 'BB Dưới',
        data: bollingerBands.lower,
        borderColor: 'rgba(147, 51, 234, 0.5)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
        order: 3,
      },
      // Volume Bars
      {
        type: 'bar' as const,
        label: `${symbol} Khối lượng`,
        data: data.volume,
        backgroundColor: volumeColors.map(color => color + '80'),
        borderColor: volumeColors,
        borderWidth: 1,
        yAxisID: 'y1',
        order: 5,
      },
      // Volume SMA 9
      {
        type: 'line' as const,
        label: 'SMA 9 Khối lượng',
        data: volumeSMA9,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y1',
        order: 4,
      },
    ],
  };

  const options: any = {
    ...defaultChartOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins?.legend,
        display: true,
        position: 'top',
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return formatDate(data.timestamps[index]);
          },
          label: (context: any) => {
            const index = context.dataIndex;
            if (context.dataset.type === 'line') {
              return [
                `Open: ${formatPrice(data.open[index])}`,
                `High: ${formatPrice(data.high[index])}`,
                `Low: ${formatPrice(data.low[index])}`,
                `Close: ${formatPrice(data.close[index])}`,
              ];
            } else {
              return `Volume: ${formatVolume(data.volume[index])}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        ...defaultChartOptions.scales?.x,
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: (value: any) => formatPrice(value),
        },
        title: {
          display: true,
          text: 'Price',
          color: chartColors.primary,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: (value: any) => formatVolume(value),
        },
        title: {
          display: true,
          text: 'Volume',
          color: chartColors.gray,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  // RSI Chart Data
  const rsiChartData = {
    labels: data.timestamps.map((date) => formatDate(date)),
    datasets: [
      {
        type: 'line' as const,
        label: 'RSI 14',
        data: rsi14,
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'SMA 14',
        data: [...new Array(rsi14.filter(v => v !== null).length - rsiSMA14.length).fill(null), ...rsiSMA14],
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [3, 3],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
      },
    ],
  };

  const rsiOptions: any = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
        },
      },
    },
  };

  // MACD Chart Data
  const macdChartData = {
    labels: data.timestamps.map((date) => formatDate(date)),
    datasets: [
      {
        type: 'line' as const,
        label: 'MACD',
        data: macdData.macd,
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Signal',
        data: macdData.signal,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Histogram',
        data: macdData.histogram,
        backgroundColor: macdData.histogram.map(v => v && v >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
        borderColor: macdData.histogram.map(v => v && v >= 0 ? '#10b981' : '#ef4444'),
        borderWidth: 1,
        yAxisID: 'y',
      },
    ],
  };

  const macdOptions: any = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
        },
      },
    },
  };

  // Prepare summary table data
  const currentPrice = data.close[data.close.length - 1];
  const openPrice = data.open[0];
  const priceChange = ((currentPrice - openPrice) / openPrice) * 100;
  const highPrice = Math.max(...data.high);
  const lowPrice = Math.min(...data.low);
  const avgVolume = data.volume.reduce((a, b) => a + b, 0) / data.volume.length;
  const currentVolume = data.volume[data.volume.length - 1];
  const volumeChange = ((currentVolume - avgVolume) / avgVolume) * 100;
  
  const summaryData = [
    { label: 'Giá mở cửa', value: formatPrice(openPrice), change: undefined },
    { label: 'Giá hiện tại', value: formatPrice(currentPrice), change: priceChange, highlight: true },
    { label: 'Giá cao nhất', value: formatPrice(highPrice), change: ((highPrice - currentPrice) / currentPrice) * 100 },
    { label: 'Giá thấp nhất', value: formatPrice(lowPrice), change: ((lowPrice - currentPrice) / currentPrice) * 100 },
    { label: 'Khối lượng TB', value: formatVolume(avgVolume), change: undefined },
    { label: 'Khối lượng hiện tại', value: formatVolume(currentVolume), change: volumeChange },
    { label: 'RSI 14', value: rsi14[rsi14.length - 1]?.toFixed(2) || 'N/A', change: undefined },
    { label: 'BB Trên', value: bollingerBands.upper[bollingerBands.upper.length - 1]?.toFixed(2) || 'N/A', change: undefined },
    { label: 'BB Giữa', value: bollingerBands.middle[bollingerBands.middle.length - 1]?.toFixed(2) || 'N/A', change: undefined },
    { label: 'BB Dưới', value: bollingerBands.lower[bollingerBands.lower.length - 1]?.toFixed(2) || 'N/A', change: undefined },
    { label: 'MACD', value: macdData.macd[macdData.macd.length - 1]?.toFixed(4) || 'N/A', change: undefined },
    { label: 'MACD Signal', value: macdData.signal[macdData.signal.length - 1]?.toFixed(4) || 'N/A', change: undefined },
  ];

  return (
    <div className="space-y-4">
      {/* Company Info Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{symbol}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Giá hiện tại:</span>
            <span className="ml-2 font-semibold">{formatPrice(currentPrice)}</span>
          </div>
          <div>
            <span className="text-gray-600">Cao:</span>
            <span className="ml-2 font-semibold">{formatPrice(highPrice)}</span>
          </div>
          <div>
            <span className="text-gray-600">Thấp:</span>
            <span className="ml-2 font-semibold">{formatPrice(lowPrice)}</span>
          </div>
          <div>
            <span className="text-gray-600">Khối lượng:</span>
            <span className="ml-2 font-semibold">{formatVolume(currentVolume)}</span>
          </div>
        </div>
      </div>

      {/* Main Price Chart with Summary Table on the side */}
      <div className="flex gap-4">
        {/* Chart */}
        <div className="flex-1" style={{ minHeight: '400px' }}>
          <Chart type="bar" data={chartData} options={options} />
        </div>
        
        {/* Summary Table */}
        <div className="w-80 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tham chiếu</h3>
          <SummaryTable data={summaryData} />
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h4 className="font-semibold text-gray-700 mb-1">Khối lượng SMA 9</h4>
          <p className="text-gray-600">
            {volumeSMA9[volumeSMA9.length - 1] 
              ? formatVolume(volumeSMA9[volumeSMA9.length - 1]!) 
              : 'N/A'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h4 className="font-semibold text-gray-700 mb-1">Bollinger Bands</h4>
          <div className="text-gray-600 space-y-1">
            <div>Trên: {bollingerBands.upper[bollingerBands.upper.length - 1]?.toFixed(2) || 'N/A'}</div>
            <div>Giữa: {bollingerBands.middle[bollingerBands.middle.length - 1]?.toFixed(2) || 'N/A'}</div>
            <div>Dưới: {bollingerBands.lower[bollingerBands.lower.length - 1]?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h4 className="font-semibold text-gray-700 mb-1">RSI 14</h4>
          <p className="text-gray-600">
            {rsi14[rsi14.length - 1]?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>

      {/* RSI Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">RSI 14 & SMA 14</h4>
        <div style={{ height: '150px' }}>
          <Chart type="line" data={rsiChartData} options={rsiOptions} />
        </div>
      </div>

      {/* MACD Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">MACD</h4>
        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
          <div className="text-gray-600">
            MACD: <span className="font-semibold">{macdData.macd[macdData.macd.length - 1]?.toFixed(4) || 'N/A'}</span>
          </div>
          <div className="text-gray-600">
            Signal: <span className="font-semibold">{macdData.signal[macdData.signal.length - 1]?.toFixed(4) || 'N/A'}</span>
          </div>
          <div className="text-gray-600">
            Histogram: <span className="font-semibold">{macdData.histogram[macdData.histogram.length - 1]?.toFixed(4) || 'N/A'}</span>
          </div>
        </div>
        <div style={{ height: '150px' }}>
          <Chart type="bar" data={macdChartData} options={macdOptions} />
        </div>
      </div>
    </div>
  );
}
