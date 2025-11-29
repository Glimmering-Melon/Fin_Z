interface SummaryTableProps {
  data: {
    label: string;
    value: string | number;
    change?: number;
    highlight?: boolean;
  }[];
}

export default function SummaryTable({ data }: SummaryTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Chỉ số
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Giá trị
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Thay đổi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr 
              key={index} 
              className={`hover:bg-gray-50 transition-colors ${row.highlight ? 'bg-blue-50' : ''}`}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {row.label}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-700 font-semibold">
                {row.value}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {row.change !== undefined ? (
                  <span className={`font-semibold ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
