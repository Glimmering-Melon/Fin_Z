import MainLayout from '@/Layouts/MainLayout';

export default function Simulator() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Simulator</h1>
          <p className="mt-1 text-sm text-gray-400">Mô phỏng đầu tư và tính toán lợi nhuận</p>
        </div>
        {/* TODO: Input form (amount, symbol, start date) */}
        {/* TODO: Calculate P/L */}
        {/* TODO: Show results table */}
        {/* TODO: Growth chart */}
        {/* TODO: Compare multiple stocks */}
      </div>
    </MainLayout>
  );
}
