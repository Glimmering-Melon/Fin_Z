import MainLayout from '@/Layouts/MainLayout';

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Overview Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Theo dõi thị trường chứng khoán Việt Nam</p>
        </div>
        {/* TODO: VN-Index, HNX-Index, UPCOM */}
        {/* TODO: Top gainers/losers */}
        {/* TODO: Volume chart */}
        {/* TODO: Watchlist */}
        {/* TODO: Search stocks */}
      </div>
    </MainLayout>
  );
}
