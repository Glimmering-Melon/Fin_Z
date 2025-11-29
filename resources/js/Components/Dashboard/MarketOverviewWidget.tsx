import { useEffect, useState } from 'react';
import axios from 'axios';

interface IndexData {
  value: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketData {
  indices: {
    vnindex: IndexData;
    hnx: IndexData;
    upcom: IndexData;
  };
  timestamp: string;
}

interface MarketOverviewWidgetProps {
  initialData?: MarketData;
}

export default function MarketOverviewWidget({ initialData }: MarketOverviewWidgetProps) {
  const [data, setData] = useState<MarketData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/market/overview');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`;
    }
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`;
    }
    return vol.toString();
  };

  const IndexCard = ({ title, data }: { title: string; data: IndexData }) => {
    const isPositive = data.change >= 0;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const bgClass = isPositive ? 'bg-green-50' : 'bg-red-50';

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(data.value)}
          </p>
          <div className={`${bgClass} ${colorClass} px-3 py-1 rounded-full`}>
            <span className="text-sm font-semibold">
              {isPositive ? '+' : ''}{formatNumber(data.change)} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Volume: {formatVolume(data.volume)}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Failed to load market data
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Market Overview</h2>
        <span className="text-xs text-gray-500">
          Auto-refresh every 30s
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IndexCard title="VN-INDEX" data={data.indices.vnindex} />
        <IndexCard title="HNX-INDEX" data={data.indices.hnx} />
        <IndexCard title="UPCOM-INDEX" data={data.indices.upcom} />
      </div>
    </div>
  );
}
