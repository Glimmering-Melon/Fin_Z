import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { chartColors, defaultChartOptions, formatDate, formatPrice } from '@/utils/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface PriceData {
  timestamps: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
}

interface PriceLineChartProps {
  data: PriceData;
  symbol: string;
}

export default function PriceLineChart({ data, symbol }: PriceLineChartProps) {
  const chartData = {
    labels: data.timestamps.map((date) => formatDate(date)),
    datasets: [
      {
        label: `${symbol} Close Price`,
        data: data.close,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartColors.primary,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: any = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return formatDate(data.timestamps[index]);
          },
          label: (context: any) => {
            const index = context.dataIndex;
            return [
              `Open: ${formatPrice(data.open[index])}`,
              `High: ${formatPrice(data.high[index])}`,
              `Low: ${formatPrice(data.low[index])}`,
              `Close: ${formatPrice(data.close[index])}`,
            ];
          },
        },
      },
    },
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales?.y,
        ticks: {
          ...defaultChartOptions.scales?.y?.ticks,
          callback: (value: any) => formatPrice(value),
        },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
