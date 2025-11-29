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
import { Line, Bar } from 'react-chartjs-2';
import { defaultChartOptions, formatDate, formatVolume } from '@/utils/chartConfig';
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

interface StockCompareData {
  symbol: string;
  timestamps: string[];
  close: number[];
  volume: number[];
}

interface CompareChartProps {
  data: StockCompareData[];
}

const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
];

// Normalize prices to percentage change from first data point
const normalizeToPercentage = (prices: number[]): number[] => {
  if (prices.length === 0) return [];
  const basePrice = prices[0];
  return prices.map(price => ((price - basePrice) / basePrice) * 100);
};

export default function CompareChart({ data }: CompareChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">Vui lòng chọn ít nhất 1 mã cổ phiếu để so sánh</p>
      </div>
    );
  }

  // Find the common date range (intersection of all timestamps)
  const allTimestamps = data.map(d => d.timestamps);
  const commonTimestamps = allTimestamps.length > 0 
    ? allTimestamps.reduce((acc, timestamps) => {
        return acc.filter(ts => timestamps.includes(ts));
      })
    : [];

  console.log('Compare chart data:', data);
  console.log('Common timestamps:', commonTimestamps.length);

  if (commonTimestamps.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-12 text-center">
        <p className="text-yellow-800">Không tìm thấy dữ liệu chung giữa các mã cổ phiếu</p>
        <p className="text-sm text-yellow-600 mt-2">Vui lòng thử chọn khoảng thời gian khác</p>
      </div>
    );
  }

  // Prepare datasets with normalized data
  const datasets = data.map((stock, index) => {
    // Filter data to only include common timestamps
    const filteredData = stock.timestamps
      .map((ts, i) => ({ ts, price: stock.close[i] }))
      .filter(item => commonTimestamps.includes(item.ts))
      .map(item => item.price);

    const normalizedData = normalizeToPercentage(filteredData);

    return {
      label: stock.symbol,
      data: normalizedData,
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '20',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: CHART_COLORS[index % CHART_COLORS.length],
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
    };
  });

  const chartData = {
    labels: commonTimestamps.map(date => formatDate(date)),
    datasets,
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
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500',
          },
          padding: 15,
          usePointStyle: true,
        },
        onClick: (_e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);

          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();
        },
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return formatDate(commonTimestamps[index]);
          },
          label: (context: any) => {
            const value = context.parsed.y;
            const symbol = context.dataset.label;
            return `${symbol}: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
          },
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
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: (value: any) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`,
        },
        title: {
          display: true,
          text: 'Thay đổi (%)',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  // Calculate statistics for each stock
  const stats = data.map((stock, index) => {
    const filteredData = stock.timestamps
      .map((ts, i) => ({ ts, price: stock.close[i] }))
      .filter(item => commonTimestamps.includes(item.ts))
      .map(item => item.price);

    const normalizedData = normalizeToPercentage(filteredData);
    const currentChange = normalizedData[normalizedData.length - 1];
    const maxChange = Math.max(...normalizedData);
    const minChange = Math.min(...normalizedData);

    return {
      symbol: stock.symbol,
      color: CHART_COLORS[index % CHART_COLORS.length],
      currentChange,
      maxChange,
      minChange,
    };
  });

  // Volume Chart Data
  const volumeDatasets = data.map((stock, index) => {
    const filteredVolume = stock.timestamps
      .map((ts, i) => ({ ts, volume: stock.volume[i] }))
      .filter(item => commonTimestamps.includes(item.ts))
      .map(item => item.volume);

    return {
      label: stock.symbol,
      data: filteredVolume,
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + '60',
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      borderWidth: 1,
    };
  });

  const volumeChartData = {
    labels: commonTimestamps.map(date => formatDate(date)),
    datasets: volumeDatasets,
  };

  const volumeOptions: any = {
    ...defaultChartOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
          },
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return formatDate(commonTimestamps[index]);
          },
          label: (context: any) => {
            const value = context.parsed.y;
            const symbol = context.dataset.label;
            return `${symbol}: ${formatVolume(value)}`;
          },
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
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
          callback: (value: any) => formatVolume(value),
        },
        title: {
          display: true,
          text: 'Khối lượng',
          color: '#6b7280',
          font: {
            size: 11,
            weight: 'bold',
          },
        },
      },
    },
  };

  // Prepare summary table data for all stocks
  const summaryTableData = data.flatMap((stock, index) => {
    const filteredData = stock.timestamps
      .map((ts, i) => ({ ts, price: stock.close[i], volume: stock.volume[i] }))
      .filter(item => commonTimestamps.includes(item.ts));

    const prices = filteredData.map(item => item.price);
    const volumes = filteredData.map(item => item.volume);
    const normalizedData = normalizeToPercentage(prices);
    
    const currentChange = normalizedData[normalizedData.length - 1];
    const maxChange = Math.max(...normalizedData);
    const minChange = Math.min(...normalizedData);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeChange = ((currentVolume - avgVolume) / avgVolume) * 100;

    return [
      { label: `${stock.symbol} - Thay đổi`, value: `${currentChange >= 0 ? '+' : ''}${currentChange.toFixed(2)}%`, change: currentChange },
      { label: `${stock.symbol} - Cao nhất`, value: `+${maxChange.toFixed(2)}%`, change: maxChange },
      { label: `${stock.symbol} - Thấp nhất`, value: `${minChange.toFixed(2)}%`, change: minChange },
      { label: `${stock.symbol} - KL TB`, value: formatVolume(avgVolume), change: undefined },
      { label: `${stock.symbol} - KL hiện tại`, value: formatVolume(currentVolume), change: volumeChange },
    ];
  });

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div
            key={stat.symbol}
            className="rounded-lg border border-gray-200 bg-white p-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: stat.color }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.symbol}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Thay đổi hiện tại:</span>
                <span className={`font-semibold ${stat.currentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.currentChange >= 0 ? '+' : ''}{stat.currentChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cao nhất:</span>
                <span className="font-semibold text-green-600">
                  +{stat.maxChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thấp nhất:</span>
                <span className="font-semibold text-red-600">
                  {stat.minChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Chart with Summary Table on the side */}
      <div className="flex gap-4">
        {/* Chart */}
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">So sánh giá (% thay đổi)</h3>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={options} />
          </div>
        </div>
        
        {/* Summary Table */}
        <div className="w-80 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tham chiếu</h3>
          <SummaryTable data={summaryTableData} />
        </div>
      </div>

      {/* Volume Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">So sánh khối lượng giao dịch</h3>
        <div style={{ height: '250px' }}>
          <Bar data={volumeChartData} options={volumeOptions} />
        </div>
      </div>

      {/* Legend Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600">
          <strong>Lưu ý:</strong> Biểu đồ giá hiển thị % thay đổi so với điểm bắt đầu của khoảng thời gian được chọn.
          Click vào tên mã trong legend để ẩn/hiện đường biểu đồ.
        </p>
      </div>
    </div>
  );
}
