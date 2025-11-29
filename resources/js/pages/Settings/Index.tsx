import MainLayout from '@/Layouts/MainLayout';

export default function Settings() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-400">Cài đặt hệ thống</p>
        </div>
        {/* TODO: Theme selector (light/dark) */}
        {/* TODO: Anomaly threshold input */}
        {/* TODO: API keys management */}
        {/* TODO: Watchlist management */}
      </div>
    </MainLayout>
  );
}
