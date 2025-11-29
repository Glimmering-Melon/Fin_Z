import MainLayout from '@/Components/MainLayout';

interface SimpleProps {
  initialData?: {
    indices: {
      vnindex: any;
      hnx: any;
      upcom: any;
    };
  };
}

export default function SimpleDashboard({ initialData }: SimpleProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-green-600 mb-4">
            ✅ Dashboard Loaded Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Authentication and routing are working correctly.
          </p>
        </div>

        {/* Market Overview - Simple Version */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">VN-INDEX</h3>
            <p className="text-3xl font-bold text-gray-900">
              {initialData?.indices?.vnindex?.value || 0}
            </p>
            <p className={`text-sm mt-2 ${
              (initialData?.indices?.vnindex?.change || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {(initialData?.indices?.vnindex?.change || 0) >= 0 ? '+' : ''}
              {initialData?.indices?.vnindex?.change || 0} 
              ({(initialData?.indices?.vnindex?.changePercent || 0)}%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">HNX-INDEX</h3>
            <p className="text-3xl font-bold text-gray-900">
              {initialData?.indices?.hnx?.value || 0}
            </p>
            <p className={`text-sm mt-2 ${
              (initialData?.indices?.hnx?.change || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {(initialData?.indices?.hnx?.change || 0) >= 0 ? '+' : ''}
              {initialData?.indices?.hnx?.change || 0}
              ({(initialData?.indices?.hnx?.changePercent || 0)}%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">UPCOM-INDEX</h3>
            <p className="text-3xl font-bold text-gray-900">
              {initialData?.indices?.upcom?.value || 0}
            </p>
            <p className={`text-sm mt-2 ${
              (initialData?.indices?.upcom?.change || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {(initialData?.indices?.upcom?.change || 0) >= 0 ? '+' : ''}
              {initialData?.indices?.upcom?.change || 0}
              ({(initialData?.indices?.upcom?.changePercent || 0)}%)
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Next Steps:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>Add stock data: <code className="bg-blue-100 px-2 py-1 rounded">php artisan db:seed --class=StockSeeder</code></li>
            <li>Navigate to other pages using the menu</li>
            <li>Test the full dashboard with widgets</li>
          </ul>
        </div>

      </div>
    </MainLayout>
  );
}
