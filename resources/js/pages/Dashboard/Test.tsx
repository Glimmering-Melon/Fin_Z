export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Dashboard is Working!
          </h1>
          <p className="text-gray-600 mb-4">
            If you can see this page, it means:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✅ Login successful</li>
            <li>✅ Authentication working</li>
            <li>✅ Inertia.js working</li>
            <li>✅ React rendering</li>
            <li>✅ Vite dev server connected</li>
          </ul>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Next Steps:</h2>
            <p className="text-blue-700">
              The issue is with the Dashboard widgets. We'll fix them step by step.
            </p>
          </div>
          
          <div className="mt-4">
            <a 
              href="/login" 
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
