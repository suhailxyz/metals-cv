import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, Coins, DollarSign, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddMetalDialog from '@/components/AddMetalDialog';
import PortfolioChart from '@/components/PortfolioChart';
import MetalCard from '@/components/MetalCard';
import { MetalItem, MarketPrices } from '@/types/metals';
import { calculatePortfolioValue, mockMarketPrices, convertToOunces } from '@/utils/metalCalculations';

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
  const [editMetal, setEditMetal] = useState<MetalItem | null>(null);

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

  const handleEditMetal = (metal: MetalItem) => {
    setEditMetal(metal);
    setIsAddDialogOpen(true);
  };

  const handleSaveMetal = (metal: Omit<MetalItem, 'id'>) => {
    if (editMetal) {
      setMetals(prev => prev.map(m => m.id === editMetal.id ? { ...metal, id: editMetal.id } : m));
      setEditMetal(null);
      setIsAddDialogOpen(false);
    } else {
      const newMetal: MetalItem = { ...metal, id: Date.now().toString() };
      setMetals(prev => [...prev, newMetal]);
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Live Market Prices Ticker */}
        <div className="bg-gray-900 text-white py-2 px-4 rounded-lg mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <TrendingUp className="h-3 w-3" />
              <span>Live Prices (per oz)</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-medium">AU</span>
                <span className="font-mono">${marketPrices.gold.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-medium">AG</span>
                <span className="font-mono">${marketPrices.silver.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">PT</span>
                <span className="font-mono">${marketPrices.platinum.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">PD</span>
                <span className="font-mono">${marketPrices.palladium.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

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
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-slate-100 text-gray-700 text-left">
                      <th className="px-4 py-2 rounded-l-lg">Metal</th>
                      <th className="px-4 py-2">Form</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Weight</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Purity</th>
                      <th className="px-4 py-2">Purchase Date</th>
                      <th className="px-4 py-2">Purchase Cost</th>
                      <th className="px-4 py-2">Current Value</th>
                      <th className="px-4 py-2">P&L</th>
                      <th className="px-4 py-2 rounded-r-lg"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {metals.map((metal) => {
                      const currentValue = calculatePortfolioValue([metal], marketPrices).totalValue;
                      const purchaseCost = calculatePortfolioValue([metal], marketPrices).totalCost;
                      const gainLoss = currentValue - purchaseCost;
                      const gainLossPercent = purchaseCost !== 0 ? (gainLoss / purchaseCost) * 100 : 0;
                      const weightInOz = metal.weightUnit === 'oz' ? metal.weight : convertToOunces(metal.weight, metal.weightUnit);
                      const metalColors: Record<string, string> = {
                        gold: 'bg-yellow-400',
                        silver: 'bg-gray-400',
                        platinum: 'bg-gray-600',
                        palladium: 'bg-gray-800',
                      };
                      return (
                        <tr key={metal.id} className="bg-white hover:bg-slate-50 transition rounded-lg shadow-sm">
                          <td className="px-4 py-2 font-semibold capitalize flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${metalColors[metal.type] || 'bg-gray-300'}`}></span>
                            {metal.type}
                          </td>
                          <td className="px-4 py-2"><span className="inline-block bg-slate-100 rounded px-2 py-1 text-xs font-medium text-gray-700">{metal.form}</span></td>
                          <td className="px-4 py-2 text-gray-600">{metal.description || '-'}</td>
                          <td className="px-4 py-2">{metal.weight} {metal.weightUnit}<br /><span className="text-xs text-gray-400">({weightInOz.toFixed(3)} oz)</span></td>
                          <td className="px-4 py-2">{metal.quantity}</td>
                          <td className="px-4 py-2">{(metal.purity * 100).toFixed(2)}%</td>
                          <td className="px-4 py-2">{new Date(metal.purchaseDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2">${purchaseCost.toLocaleString()}</td>
                          <td className="px-4 py-2 font-bold">${currentValue.toLocaleString()}</td>
                          <td className={`px-4 py-2 font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} ({gainLossPercent.toFixed(2)}%)</td>
                          <td className="px-4 py-2 flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditMetal(metal)}>
                              <Pencil className="h-4 w-4 text-gray-400 hover:text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMetal(metal.id)}>
                              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <AddMetalDialog
          isOpen={isAddDialogOpen}
          onClose={() => { setIsAddDialogOpen(false); setEditMetal(null); }}
          onAdd={handleSaveMetal}
          {...(editMetal ? { initialData: editMetal } : {})}
        />
      </div>
    </div>
  );
};

export default Index;
