import MainLayout from '@/Layouts/MainLayout';

export default function Heatmap() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Heatmap</h1>
          <p className="mt-1 text-sm text-gray-400">Bản đồ nhiệt thị trường chứng khoán</p>
        </div>
        {/* TODO: D3.js heatmap visualization */}
        {/* TODO: Color gradient (red to green) */}
        {/* TODO: Filter by sector */}
        {/* TODO: Tooltip with details */}
        {/* TODO: Zoom/expand functionality */}
      </div>
    </MainLayout>
  );
}
