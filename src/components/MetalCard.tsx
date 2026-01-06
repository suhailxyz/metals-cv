
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { MetalItem } from '@/types/metals';
import { calculateItemValue, calculateItemCost, convertToOunces } from '@/utils/metalCalculations';

interface MetalCardProps {
  metal: MetalItem;
  marketPrice: number;
  onDelete: (id: string) => void;
}

const MetalCard: React.FC<MetalCardProps> = ({ metal, marketPrice, onDelete }) => {
  const currentValue = calculateItemValue(metal, marketPrice);
  const purchaseCostOnly = metal.purchasePrice * metal.quantity;
  const taxPaid = metal.purchaseTax || 0;
  const totalCost = calculateItemCost(metal);
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = (gainLoss / totalCost) * 100;
  const weightInOz = convertToOunces(metal.weight, metal.weightUnit);

  const getMetalColor = (type: string) => {
    switch (type) {
      case 'gold': return 'from-yellow-400 to-yellow-500';
      case 'silver': return 'from-gray-300 to-gray-400';
      case 'platinum': return 'from-gray-600 to-gray-700';
      case 'palladium': return 'from-gray-800 to-gray-900';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className={`bg-gradient-to-r ${getMetalColor(metal.type)} text-white pb-3`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg capitalize">{metal.type}</CardTitle>
            <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-0">
              {metal.form}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(metal.id)}
            className="text-white hover:bg-white/20 p-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {metal.description && (
            <p className="text-sm text-gray-600 font-medium">{metal.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Weight:</span>
              <div className="font-medium">{metal.weight} {metal.weightUnit}</div>
              <div className="text-xs text-gray-400">({weightInOz.toFixed(3)} oz)</div>
            </div>
            <div>
              <span className="text-gray-500">Quantity:</span>
              <div className="font-medium">{metal.quantity}</div>
            </div>
            <div>
              <span className="text-gray-500">Purity:</span>
              <div className="font-medium">{(metal.purity * 100).toFixed(2)}%</div>
            </div>
            <div>
              <span className="text-gray-500">Purchase Date:</span>
              <div className="font-medium">{new Date(metal.purchaseDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">Purchase Cost:</span>
              <span className="font-medium">${purchaseCostOnly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {taxPaid > 0 && (
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Tax:</span>
                <span className="font-medium">${taxPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 font-semibold">Total Cost:</span>
              <span className="font-semibold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Current Value:</span>
              <span className="font-bold text-lg">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">P&L:</span>
              <div className={`flex items-center gap-1 ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium">
                  {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({gainLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetalCard;
