import MainLayout from '@/Layouts/MainLayout';
import MarketOverviewWidget from '@/Components/MarketOverviewWidget';

interface MarketIndex {
  index: string;
  value: number;
  change: number;
  percentChange: number;
  volume: number;
  lastUpdated: string;
}

interface DashboardProps {
  marketOverview: MarketIndex[];
}

export default function Dashboard({ marketOverview }: DashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Overview Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Theo dõi thị trường chứng khoán Việt Nam</p>
        </div>

        {/* Market Overview Widget */}
        <MarketOverviewWidget data={marketOverview} autoRefresh={true} refreshInterval={30000} />

        {/* TODO: Top gainers/losers */}
        {/* TODO: Volume chart */}
        {/* TODO: Watchlist */}
        {/* TODO: Search stocks */}
      </div>
    </MainLayout>
  );
}
