
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MetalItem, MarketPrices } from '@/types/metals';
import { calculateItemValue } from '@/utils/metalCalculations';

interface PortfolioChartProps {
  metals: MetalItem[];
  marketPrices: MarketPrices;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ metals, marketPrices }) => {
  // Calculate data for the pie chart
  const chartData = metals.reduce((acc, metal) => {
    const value = calculateItemValue(metal, marketPrices[metal.type]);
    const existing = acc.find(item => item.name === metal.type);
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({
        name: metal.type,
        value: value,
        color: getMetalColor(metal.type)
      });
    }
    
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);

  function getMetalColor(type: string): string {
    switch (type) {
      case 'gold': return '#F59E0B';
      case 'silver': return '#9CA3AF';
      case 'platinum': return '#6B7280';
      case 'palladium': return '#374151';
      default: return '#9CA3AF';
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium capitalize">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: ${data.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Portfolio Composition</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Portfolio Composition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="capitalize">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
