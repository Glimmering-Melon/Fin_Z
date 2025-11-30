import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { chartColors, defaultChartOptions, formatDate, formatVolume } from '@/utils/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface VolumeData {
  timestamps: string[];
  volume: number[];
  close: number[];
}

interface VolumeBarChartProps {
  data: VolumeData;
  symbol: string;
}

export default function VolumeBarChart({ data, symbol }: VolumeBarChartProps) {
  // Determine color based on price change
  const colors = data.close.map((close, index) => {
    if (index === 0) return chartColors.gray;
    return close >= data.close[index - 1] ? chartColors.success : chartColors.danger;
  });

  const chartData = {
    labels: data.timestamps.map((date) => formatDate(date)),
    datasets: [
      {
        label: `${symbol} Volume`,
        data: data.volume,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options: any = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins?.legend,
        display: false,
      },
      tooltip: {
        ...defaultChartOptions.plugins?.tooltip,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return formatDate(data.timestamps[index]);
          },
          label: (context: any) => {
            const value = context.parsed.y;
            return `Volume: ${formatVolume(value)}`;
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
          callback: (value: any) => formatVolume(value),
        },
      },
    },
  };

  return (
    <div style={{ height: '200px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
