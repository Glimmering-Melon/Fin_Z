import { useState, useEffect } from 'react';
import MainLayout from '@/Components/MainLayout';
import axios from 'axios';

interface WatchlistStock {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface SimulationResult {
  symbol: string;
  initialInvestment: number;
  finalValue: number;
  profit: number;
  profitPercent: number;
  startDate: string;
  endDate: string;
  startPrice: number;
  endPrice: number;
}

export default function Simulator() {
  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStock[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWatchlist();
    
    // Set default dates (1 year ago to today)
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
  }, []);

  const fetchWatchlist = async () => {
    try {
      console.log('Fetching watchlist...');
      const response = await axios.get('/api/user/watchlist');
      console.log('Watchlist response:', response.data);
      setWatchlistStocks(response.data);
      
      if (response.data.length > 0) {
        setSelectedSymbol(response.data[0].symbol);
        console.log('Selected first symbol:', response.data[0].symbol);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const runSimulation = async () => {
    if (!selectedSymbol || !startDate || !endDate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/simulator/simulate', {
        symbol: selectedSymbol,
        amount: investmentAmount,
        start_date: startDate,
        end_date: endDate,
      });

      setResult(response.data);
    } catch (error: any) {
      console.error('Error running simulation:', error);
      alert(error.response?.data?.message || 'Lỗi khi chạy simulation');
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setResult(null);
    setInvestmentAmount(10000);
    
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(oneYearAgo.toISOString().split('T')[0]);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Investment Simulator</h1>
          <p className="text-gray-600 mt-2">Mô phỏng đầu tư với các cổ phiếu trong watchlist của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin đầu tư</h3>
              
              {watchlistStocks.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn cổ phiếu
                    </label>
                    <select 
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {watchlistStocks.map((stock) => (
                        <option key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tiền đầu tư ($)
                    </label>
                    <input 
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button 
                    onClick={runSimulation}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang tính toán...' : 'Chạy Simulation'}
                  </button>

                  <button 
                    onClick={resetSimulation}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Watchlist trống</p>
                  <a 
                    href="/watchlist" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thêm cổ phiếu vào watchlist
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Kết quả mô phỏng</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Vốn đầu tư ban đầu</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${result.initialInvestment.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className={`rounded-lg p-4 ${result.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-sm text-gray-600 mb-1">Giá trị cuối kỳ</p>
                      <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${result.finalValue.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className={`rounded-lg p-4 ${result.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-sm text-gray-600 mb-1">Lãi/Lỗ</p>
                      <p className={`text-2xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.profit >= 0 ? '+' : ''}${result.profit.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className={`rounded-lg p-4 ${result.profitPercent >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-sm text-gray-600 mb-1">Tỷ suất lợi nhuận</p>
                      <p className={`text-2xl font-bold ${result.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.profitPercent >= 0 ? '+' : ''}{result.profitPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Mã cổ phiếu</span>
                      <span className="font-semibold text-gray-900">{result.symbol}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Ngày bắt đầu</span>
                      <span className="font-semibold text-gray-900">{result.startDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Ngày kết thúc</span>
                      <span className="font-semibold text-gray-900">{result.endDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Giá mua vào</span>
                      <span className="font-semibold text-gray-900">${result.startPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Giá bán ra</span>
                      <span className="font-semibold text-gray-900">${result.endPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Số cổ phiếu mua được</span>
                      <span className="font-semibold text-gray-900">
                        {(result.initialInvestment / result.startPrice).toFixed(2)} cổ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có kết quả</h3>
                <p className="text-gray-600">Điền thông tin và nhấn "Chạy Simulation" để xem kết quả</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
