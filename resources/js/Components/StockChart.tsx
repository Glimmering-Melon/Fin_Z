import React from 'react';

interface StockChartProps {
  symbol: string;
  timeframe?: string;
}

export default function StockChart({ symbol, timeframe = '1M' }: StockChartProps) {
  // TODO: Chart.js implementation
  // TODO: Line chart for price
  // TODO: Bar chart for volume
  return <div>Chart for {symbol}</div>;
}
