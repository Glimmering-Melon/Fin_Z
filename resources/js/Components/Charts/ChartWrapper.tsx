import { ReactNode } from 'react';

interface ChartWrapperProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ChartWrapper({
  title,
  children,
  className = '',
}: ChartWrapperProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="relative">{children}</div>
    </div>
  );
}
