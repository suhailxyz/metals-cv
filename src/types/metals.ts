
export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';
export type MetalForm = 'coin' | 'bar' | 'round' | 'jewelry' | 'other';
export type WeightUnit = 'oz' | 'g' | 'kg';

export interface MetalItem {
  id: string;
  type: MetalType;
  form: MetalForm;
  weight: number;
  weightUnit: WeightUnit;
  purity: number; // 0-1 (e.g., 0.999 for 99.9% pure)
  quantity: number;
  purchasePrice: number; // price per unit when purchased
  purchaseTax?: number; // total tax paid for the purchase
  purchaseDate: string;
  description?: string;
}

export interface MarketPrices {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalItems: number;
  totalWeight: number;
  uniqueTypes: number;
  unrealizedPL: number;
  byType: Record<MetalType, { value: number; weight: number; items: number }>;
}
