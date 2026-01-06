
import { MetalItem, MarketPrices, PortfolioStats, MetalType } from '@/types/metals';

export const mockMarketPrices: MarketPrices = {
  gold: 2015.50,
  silver: 24.75,
  platinum: 995.00,
  palladium: 1245.00
};

// Convert weight to troy ounces
export const convertToOunces = (weight: number, unit: string): number => {
  switch (unit) {
    case 'g':
      return weight / 31.1035;
    case 'kg':
      return weight * 32.1507;
    default: // 'oz'
      return weight;
  }
};

// Calculate current market value of a metal item
export const calculateItemValue = (item: MetalItem, marketPrice: number): number => {
  const weightInOz = convertToOunces(item.weight, item.weightUnit);
  const pureWeight = weightInOz * item.purity;
  return pureWeight * marketPrice * item.quantity;
};

// Calculate total purchase cost of an item (including tax)
export const calculateItemCost = (item: MetalItem): number => {
  return (item.purchasePrice * item.quantity) + (item.purchaseTax || 0);
};

// Calculate comprehensive portfolio statistics
export const calculatePortfolioValue = (metals: MetalItem[], marketPrices: MarketPrices): PortfolioStats => {
  let totalValue = 0;
  let totalCost = 0;
  let totalWeight = 0;
  const typeStats: Record<MetalType, { value: number; weight: number; items: number }> = {
    gold: { value: 0, weight: 0, items: 0 },
    silver: { value: 0, weight: 0, items: 0 },
    platinum: { value: 0, weight: 0, items: 0 },
    palladium: { value: 0, weight: 0, items: 0 }
  };

  metals.forEach(metal => {
    const itemValue = calculateItemValue(metal, marketPrices[metal.type]);
    const itemCost = calculateItemCost(metal);
    const itemWeight = convertToOunces(metal.weight, metal.weightUnit) * metal.quantity;

    totalValue += itemValue;
    totalCost += itemCost;
    totalWeight += itemWeight;

    typeStats[metal.type].value += itemValue;
    typeStats[metal.type].weight += itemWeight;
    typeStats[metal.type].items += metal.quantity;
  });

  const uniqueTypes = Object.values(typeStats).filter(stat => stat.items > 0).length;
  const unrealizedPL = totalValue - totalCost;

  return {
    totalValue,
    totalCost,
    totalItems: metals.reduce((sum, metal) => sum + metal.quantity, 0),
    totalWeight,
    uniqueTypes,
    unrealizedPL,
    byType: typeStats
  };
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format weight
export const formatWeight = (weight: number, unit: string = 'oz'): string => {
  return `${weight.toFixed(3)} ${unit}`;
};
