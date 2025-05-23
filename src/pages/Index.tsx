
import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, Coins, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddMetalDialog from '@/components/AddMetalDialog';
import PortfolioChart from '@/components/PortfolioChart';
import MetalCard from '@/components/MetalCard';
import { MetalItem, MarketPrices } from '@/types/metals';
import { calculatePortfolioValue, mockMarketPrices } from '@/utils/metalCalculations';

const Index = () => {
  const [metals, setMetals] = useState<MetalItem[]>([
    {
      id: '1',
      type: 'gold',
      form: 'coin',
      weight: 1,
      weightUnit: 'oz',
      purity: 0.9999,
      quantity: 5,
      purchasePrice: 1950,
      purchaseDate: '2024-01-15',
      description: 'American Gold Eagle 1oz'
    },
    {
      id: '2',
      type: 'silver',
      form: 'bar',
      weight: 10,
      weightUnit: 'oz',
      purity: 0.999,
      quantity: 3,
      purchasePrice: 23.50,
      purchaseDate: '2024-02-01',
      description: 'PAMP Suisse 10oz Silver Bar'
    },
    {
      id: '3',
      type: 'platinum',
      form: 'coin',
      weight: 1,
      weightUnit: 'oz',
      purity: 0.9995,
      quantity: 2,
      purchasePrice: 980,
      purchaseDate: '2024-03-10',
      description: 'American Platinum Eagle'
    }
  ]);

  const [marketPrices, setMarketPrices] = useState<MarketPrices>(mockMarketPrices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrices(prev => ({
        gold: prev.gold + (Math.random() - 0.5) * 20,
        silver: prev.silver + (Math.random() - 0.5) * 2,
        platinum: prev.platinum + (Math.random() - 0.5) * 15,
        palladium: prev.palladium + (Math.random() - 0.5) * 30
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const portfolioStats = calculatePortfolioValue(metals, marketPrices);

  const handleAddMetal = (newMetal: Omit<MetalItem, 'id'>) => {
    const metal: MetalItem = {
      ...newMetal,
      id: Date.now().toString()
    };
    setMetals(prev => [...prev, metal]);
  };

  const handleDeleteMetal = (id: string) => {
    setMetals(prev => prev.filter(metal => metal.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Coins className="h-10 w-10 text-amber-600" />
              Precious Metals Tracker
            </h1>
            <p className="text-lg text-gray-600">Track your precious metals portfolio with live market pricing</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white mt-4 md:mt-0"
            size="lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Metal
          </Button>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${portfolioStats.totalValue.toLocaleString()}</div>
              <div className="flex items-center mt-2 text-amber-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Live pricing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{portfolioStats.totalItems}</div>
              <div className="text-sm text-gray-500 mt-2">Across {portfolioStats.uniqueTypes} metal types</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Weight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{portfolioStats.totalWeight.toFixed(2)}</div>
              <div className="text-sm text-gray-500 mt-2">Troy ounces</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Unrealized P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${portfolioStats.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(portfolioStats.unrealizedPL).toLocaleString()}
              </div>
              <div className={`text-sm mt-2 ${portfolioStats.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioStats.unrealizedPL >= 0 ? '+' : '-'}{((Math.abs(portfolioStats.unrealizedPL) / portfolioStats.totalCost) * 100).toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Prices */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              Live Market Prices (per Troy Ounce)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg text-white">
                <div className="text-sm font-medium opacity-90">Gold</div>
                <div className="text-2xl font-bold">${marketPrices.gold.toFixed(2)}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg text-white">
                <div className="text-sm font-medium opacity-90">Silver</div>
                <div className="text-2xl font-bold">${marketPrices.silver.toFixed(2)}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg text-white">
                <div className="text-sm font-medium opacity-90">Platinum</div>
                <div className="text-2xl font-bold">${marketPrices.platinum.toFixed(2)}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg text-white">
                <div className="text-sm font-medium opacity-90">Palladium</div>
                <div className="text-2xl font-bold">${marketPrices.palladium.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Composition Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PortfolioChart metals={metals} marketPrices={marketPrices} />
          
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Portfolio Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(portfolioStats.byType).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        type === 'gold' ? 'bg-yellow-500' :
                        type === 'silver' ? 'bg-gray-400' :
                        type === 'platinum' ? 'bg-gray-600' :
                        'bg-gray-800'
                      }`} />
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${data.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{data.weight.toFixed(2)} oz</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Your Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {metals.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No metals in your portfolio</h3>
                <p className="text-gray-500 mb-4">Start tracking your precious metals collection</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700">
                  Add Your First Metal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metals.map((metal) => (
                  <MetalCard
                    key={metal.id}
                    metal={metal}
                    marketPrice={marketPrices[metal.type]}
                    onDelete={handleDeleteMetal}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AddMetalDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddMetal}
        />
      </div>
    </div>
  );
};

export default Index;
