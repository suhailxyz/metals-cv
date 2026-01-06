import React, { useState, useMemo } from 'react';
import { MetalItem, MarketPrices } from '@/types/metals';
import { calculateItemValue } from '@/utils/metalCalculations';

interface PortfolioChartProps {
  metals: MetalItem[];
  marketPrices: MarketPrices | null;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ metals, marketPrices }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate data for the chart
  const chartData = useMemo(() => {
    if (!marketPrices) return [];
    
    return metals.reduce((acc, metal) => {
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
  }, [metals, marketPrices]);

  const totalValue = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  function getMetalColor(type: string): string {
    switch (type) {
      case 'gold': return '#F59E0B';
      case 'silver': return '#9CA3AF';
      case 'platinum': return '#6B7280';
      case 'palladium': return '#374151';
      default: return '#9CA3AF';
    }
  }

  // Calculate pie slice angles
  const slices = useMemo(() => {
    if (chartData.length === 0 || totalValue === 0) return [];
    
    let currentAngle = -90; // Start at top
    return chartData.map((item) => {
      const percentage = (item.value / totalValue) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      currentAngle = endAngle;
      return {
        ...item,
        startAngle,
        endAngle,
        percentage
      };
    });
  }, [chartData, totalValue]);

  if (!marketPrices) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#F59E0B] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading market prices...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-gray-600 font-semibold">No portfolio data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Header Section */}
      <div className="mb-6">
        <p className="text-xs text-[#EC4899] uppercase tracking-wide mb-1 font-semibold">
          Your Portfolio Composition
        </p>
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">
          Portfolio Distribution
        </h2>
      </div>

      {/* Simple Pie Chart */}
      <div className="relative w-full flex items-center justify-center" style={{ height: '400px' }}>
        <svg
          width="380"
          height="380"
          viewBox="0 0 380 380"
        >
          {/* Pie slices */}
          {slices.map((slice, index) => {
            const isHovered = hoveredIndex === index;
            const radius = 150;
            const cx = 190;
            const cy = 190;
            
            // Calculate arc for full pie slice
            const startRad = (slice.startAngle * Math.PI) / 180;
            const endRad = (slice.endAngle * Math.PI) / 180;
            
            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);
            
            const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${cx} ${cy}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={slice.name}
                d={pathData}
                fill={slice.color}
                stroke="#000000"
                strokeWidth="2"
                className="cursor-pointer transition-opacity duration-200"
                style={{
                  opacity: isHovered ? 1 : 0.95
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && slices[hoveredIndex] && (() => {
          const slice = slices[hoveredIndex];
          
          return (
            <div className="absolute bg-white p-4 border-2 border-black rounded-xl shadow-xl z-10 pointer-events-none">
              <p className="font-black text-base capitalize mb-1 text-black">{slice.name}</p>
              <p className="text-sm text-gray-700 font-bold mb-1">
                ${slice.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-600 font-semibold">
                {slice.percentage.toFixed(1)}%
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PortfolioChart;
