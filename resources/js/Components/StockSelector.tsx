import { useState, useRef, useEffect } from 'react';

interface StockSelectorProps {
  selectedSymbols: string[];
  onSymbolsChange: (symbols: string[]) => void;
  maxSelections?: number;
}

const POPULAR_STOCKS = [
  'VNM', 'VCB', 'HPG', 'VHM', 'VIC', 'MSN', 'FPT', 'GAS', 'TCB', 'BID',
  'CTG', 'MBB', 'VPB', 'VRE', 'PLX', 'SAB', 'POW', 'SSI', 'HDB', 'ACB'
];

export default function StockSelector({ selectedSymbols, onSymbolsChange, maxSelections = 3 }: StockSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStocks = POPULAR_STOCKS.filter(stock =>
    stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      onSymbolsChange(selectedSymbols.filter(s => s !== symbol));
    } else if (selectedSymbols.length < maxSelections) {
      onSymbolsChange([...selectedSymbols, symbol]);
    }
  };

  const removeSymbol = (symbol: string) => {
    onSymbolsChange(selectedSymbols.filter(s => s !== symbol));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn mã cổ phiếu để so sánh (tối đa {maxSelections})
        </label>
        
        {/* Selected Symbols */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedSymbols.map(symbol => (
            <span
              key={symbol}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
            >
              {symbol}
              <button
                onClick={() => removeSymbol(symbol)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
          {selectedSymbols.length === 0 && (
            <span className="text-sm text-gray-500">Chưa chọn mã nào</span>
          )}
        </div>

        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={selectedSymbols.length >= maxSelections}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {selectedSymbols.length >= maxSelections
            ? `Đã chọn tối đa ${maxSelections} mã`
            : 'Thêm mã cổ phiếu...'}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <input
                type="text"
                placeholder="Tìm kiếm mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredStocks.map(stock => (
                <button
                  key={stock}
                  onClick={() => toggleSymbol(stock)}
                  disabled={!selectedSymbols.includes(stock) && selectedSymbols.length >= maxSelections}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedSymbols.includes(stock) ? 'bg-blue-50 text-blue-700 font-medium' : ''
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{stock}</span>
                    {selectedSymbols.includes(stock) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </span>
                </button>
              ))}
              {filteredStocks.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Không tìm thấy mã nào
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
