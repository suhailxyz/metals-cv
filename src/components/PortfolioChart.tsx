import React, { useState, useMemo } from 'react';
import { MetalItem, MarketPrices } from '@/types/metals';
import { calculateItemValue } from '@/utils/metalCalculations';

interface PortfolioChartProps {
  metals: MetalItem[];
  marketPrices: MarketPrices | null;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ metals, marketPrices }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function getMetalColor(type: string): string {
    switch (type) {
      case 'gold': return '#F59E0B';
      case 'silver': return '#94A3B8';
      case 'platinum': return '#64748B';
      case 'palladium': return '#475569';
      default: return '#94A3B8';
    }
  }

  // Calculate data for the chart
  const chartData = useMemo(() => {
    if (!marketPrices) return [];
    
    const data = metals.reduce((acc, metal) => {
      const value = calculateItemValue(metal, marketPrices[metal.type]);
      if (value > 0) {
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
      }
      
      return acc;
    }, [] as Array<{ name: string; value: number; color: string }>);
    
    return data;
  }, [metals, marketPrices]);

  const totalValue = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  // Calculate pie slice angles
  const slices = useMemo(() => {
    if (chartData.length === 0 || totalValue === 0) return [];
    
    let currentAngle = -90; // Start at top
    return chartData.map((item, index) => {
      const percentage = (item.value / totalValue) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = index === chartData.length - 1 
        ? currentAngle + angle // Last slice: ensure it closes exactly
        : currentAngle + angle;
      
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
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market prices...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No portfolio data to display</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Portfolio Distribution
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your portfolio composition
        </p>
      </div>

      {/* Simple Pie Chart */}
      <div className="relative w-full flex items-center justify-center" style={{ height: '400px' }}>
        <svg
          width="380"
          height="380"
          viewBox="0 0 380 380"
        >
          {/* Pie slices */}
          {chartData.length === 1 ? (
            // Single metal - render full circle
            <circle
              cx="190"
              cy="190"
              r="150"
              fill={chartData[0].color}
              stroke="currentColor"
              strokeWidth="1"
              className="cursor-pointer transition-opacity duration-200 stroke-border"
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ) : (
            // Multiple metals - render pie slices
            slices.map((slice, index) => {
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
                  stroke="currentColor"
                  strokeWidth="1"
                  className="cursor-pointer transition-opacity duration-200 stroke-border"
                  style={{
                    opacity: isHovered ? 1 : 0.95
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && slices[hoveredIndex] && (() => {
          const slice = slices[hoveredIndex];
          
          return (
            <div className="absolute bg-popover p-3 border rounded-lg shadow-md z-10 pointer-events-none">
              <p className="font-semibold text-sm capitalize mb-1">{slice.name}</p>
              <p className="text-sm font-medium mb-1">
                ${slice.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
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
