import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, TrendingUp, Coins, DollarSign, Trash2, Pencil, Save, FolderOpen, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddMetalDialog from '@/components/AddMetalDialog';
import PortfolioChart from '@/components/PortfolioChart';
import MetalCard from '@/components/MetalCard';
import { MetalItem, MarketPrices } from '@/types/metals';
import { calculatePortfolioValue, mockMarketPrices, convertToOunces } from '@/utils/metalCalculations';

const METALS_DEV_API_KEY = import.meta.env.VITE_METALS_DEV_API_KEY;

async function fetchMetalRates() {
  const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=USD&unit=toz`;
  console.log('[fetchMetalRates] Fetching:', url);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
  const result = await response.json();
  console.log('[fetchMetalRates] Result:', result);
  
  // Check for API errors
  if (result.status === 'failure' || !result.metals) {
    console.warn('[fetchMetalRates] API error or quota exhausted, using mock prices:', result.error_message || 'Unknown error');
    // Return mock prices as fallback
    return mockMarketPrices;
  }
  
  return {
    gold: result.metals.gold,
    silver: result.metals.silver,
    platinum: result.metals.platinum,
    palladium: result.metals.palladium,
  };
}

// Default initial metals data
const DEFAULT_METALS: MetalItem[] = [
  {
    id: '1',
    type: 'gold',
    form: 'coin',
    weight: 1,
    weightUnit: 'oz',
    purity: 0.9999,
    quantity: 5,
    purchasePrice: 1950,
    purchaseTax: 0,
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
    purchaseTax: 0,
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
    purchaseTax: 0,
    purchaseDate: '2024-03-10',
    description: 'American Platinum Eagle'
  }
];

// Load metals from localStorage or return default
const loadMetalsFromStorage = (): MetalItem[] => {
  try {
    const stored = localStorage.getItem('stack-tracker-metals');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate it's an array (can be empty if user deleted all items)
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading metals from localStorage:', error);
  }
  // Only return defaults if nothing is stored (first time user)
  return DEFAULT_METALS;
};

const Index = () => {
  const [metals, setMetals] = useState<MetalItem[]>(loadMetalsFromStorage);

  const [marketPrices, setMarketPrices] = useState<MarketPrices | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editMetal, setEditMetal] = useState<MetalItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState<MetalItem[] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [metalToDelete, setMetalToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save metals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('stack-tracker-metals', JSON.stringify(metals));
    } catch (error) {
      console.error('Error saving metals to localStorage:', error);
    }
  }, [metals]);

  // Simulate live price updates
  useEffect(() => {
    const fetchAndSetPrices = async () => {
      try {
        console.log('[useEffect] Fetching live metal prices...');
        const rates = await fetchMetalRates();
        setMarketPrices(rates);
        setIsLoadingPrices(false);
        console.log('[useEffect] Updated marketPrices:', rates);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        console.error('[useEffect] Failed to fetch metal rates', e);
        setIsLoadingPrices(false);
      }
    };
    fetchAndSetPrices();
    const interval = setInterval(fetchAndSetPrices, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const portfolioStats = marketPrices ? calculatePortfolioValue(metals, marketPrices) : null;

  const handleAddMetal = (newMetal: Omit<MetalItem, 'id'>) => {
    const metal: MetalItem = {
      ...newMetal,
      id: Date.now().toString()
    };
    setMetals(prev => [...prev, metal]);
  };

  const handleDeleteMetal = (id: string) => {
    setMetalToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMetal = () => {
    if (metalToDelete) {
      setMetals(prev => prev.filter(metal => metal.id !== metalToDelete));
      setMetalToDelete(null);
      setDeleteDialogOpen(false);
    }
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

  // Export portfolio data as JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(metals, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle file input change for import
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setImportData(json);
          setImportDialogOpen(true);
        } else {
          alert('Invalid file format. Expected an array of metal items.');
        }
      } catch (error) {
        alert('Error parsing JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Replace data with imported data
  const handleReplaceData = () => {
    if (importData) {
      setMetals(importData);
      setImportDialogOpen(false);
      setImportData(null);
      // Data will be saved to localStorage automatically via useEffect
    }
  };

  // Merge imported data with existing data
  const handleMergeData = () => {
    if (importData) {
      setMetals(prev => [...prev, ...importData]);
      setImportDialogOpen(false);
      setImportData(null);
      // Data will be saved to localStorage automatically via useEffect
    }
  };

  // Trigger file input
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8">
        {/* Only render main content if prices are loaded */}
        {isLoadingPrices || !marketPrices ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <svg className="animate-spin h-10 w-10 text-[#FEF3C7] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="text-lg text-gray-300">Loading live market data...</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h1 className="text-5xl font-black text-white mb-3 flex items-center gap-4 tracking-tight">
                  <div className="relative">
                    <Coins className="h-12 w-12 text-[#F59E0B] drop-shadow-lg" />
                    <div className="absolute inset-0 bg-[#F59E0B] blur-xl opacity-30 -z-10"></div>
                  </div>
                  <span className="text-white">
                    STACK TRACKER
                  </span>
                  <Link to="/data-privacy">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-[#F59E0B] rounded-lg p-1 h-8 w-8 transition-colors"
                      title="Data Privacy & Storage Info"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </Link>
                </h1>
                <p className="text-base text-gray-400 font-medium">Track your precious metals portfolio with live market pricing</p>
              </div>
              
              {/* Live Market Prices Ticker */}
              <div className="bg-[#1a1a1a] text-white py-4 px-6 rounded-3xl border border-[#2a2a2a] shadow-xl w-full md:w-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-semibold uppercase tracking-wide">
                    <TrendingUp className="h-4 w-4 text-[#F59E0B]" />
                    <span>Live Prices{lastUpdated ? ` (last updated ${lastUpdated})` : ''}</span>
                  </div>
                  {isLoadingPrices || !marketPrices ? (
                    <div className="flex items-center gap-2 text-sm animate-pulse text-gray-400 font-semibold">
                      <span>Loading live prices...</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 gap-y-2">
                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40">
                        <span className="text-[#F59E0B] font-black text-base">AU</span>
                        <span className="font-mono text-white font-bold text-base">${marketPrices.gold.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#9CA3AF]/20 border border-[#9CA3AF]/40">
                        <span className="text-[#9CA3AF] font-black text-base">AG</span>
                        <span className="font-mono text-white font-bold text-base">${marketPrices.silver.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#6B7280]/20 border border-[#6B7280]/40">
                        <span className="text-[#6B7280] font-black text-base">PT</span>
                        <span className="font-mono text-white font-bold text-base">${marketPrices.platinum.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#374151]/20 border border-[#374151]/40">
                        <span className="text-[#374151] font-black text-base">PD</span>
                        <span className="font-mono text-white font-bold text-base">${marketPrices.palladium.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <Card className="bg-[#FEF3C7] border-2 border-[#F59E0B]/30 shadow-xl rounded-3xl p-6 hover:shadow-2xl hover:border-[#F59E0B]/50 transition-all">
                <CardHeader className="pb-3 px-0">
                  <CardTitle className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-tight">TOTAL PORTFOLIO VALUE</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="text-4xl font-black text-black mb-3 leading-none">${portfolioStats?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="flex items-center text-green-600 text-xs font-black uppercase tracking-wide">
                    <TrendingUp className="h-3 w-3 mr-1.5" />
                    <span>Live pricing</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FEF3C7] border-2 border-[#EC4899]/30 shadow-xl rounded-3xl p-6 hover:shadow-2xl hover:border-[#EC4899]/50 transition-all">
                <CardHeader className="pb-3 px-0">
                  <CardTitle className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-tight">TOTAL ITEMS</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="text-4xl font-black text-black mb-3 leading-none">{portfolioStats?.totalItems}</div>
                  <div className="text-xs text-gray-600 mt-2 font-semibold">Across {portfolioStats?.uniqueTypes} metal types</div>
                </CardContent>
              </Card>

              <Card className="bg-[#FEF3C7] border-2 border-[#9CA3AF]/30 shadow-xl rounded-3xl p-6 hover:shadow-2xl hover:border-[#9CA3AF]/50 transition-all">
                <CardHeader className="pb-3 px-0">
                  <CardTitle className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-tight">TOTAL WEIGHT</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="text-4xl font-black text-black mb-3 leading-none">{portfolioStats?.totalWeight.toFixed(2)}</div>
                  <div className="text-xs text-gray-600 mt-2 font-semibold">Troy ounces</div>
                </CardContent>
              </Card>

              <Card className={`bg-[#FEF3C7] border-2 shadow-xl rounded-3xl p-6 hover:shadow-2xl transition-all ${
                portfolioStats?.unrealizedPL >= 0 
                  ? 'border-green-500/30 hover:border-green-500/50' 
                  : 'border-red-500/30 hover:border-red-500/50'
              }`}>
                <CardHeader className="pb-3 px-0">
                  <CardTitle className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-tight">UNREALIZED P&L</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <div className={`text-4xl font-black mb-3 leading-none ${portfolioStats?.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(portfolioStats?.unrealizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-black uppercase tracking-wide ${portfolioStats?.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioStats?.unrealizedPL >= 0 ? '+' : '-'}{((Math.abs(portfolioStats?.unrealizedPL) / portfolioStats?.totalCost) * 100).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Composition & Breakdown Combined */}
            <div className="mb-10">
              <div className="bg-[#FEF3C7] rounded-3xl p-8 shadow-xl">
                <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
                  <div className="w-full lg:w-1/2">
                    <PortfolioChart 
                      metals={metals} 
                      marketPrices={marketPrices}
                    />
                  </div>
                  <div className="w-full lg:w-1/2">
                    <h2 className="text-2xl font-black mb-6 text-black uppercase tracking-tight">Breakdown</h2>
                    <div className="space-y-5">
                      {Object.entries(portfolioStats?.byType || {}).map(([type, data]) => {
                        const hasValue = data.value > 0 && data.weight > 0;
                        return (
                          <div 
                            key={type} 
                            className={`flex justify-between items-center py-2 border-b border-gray-300/30 last:border-0 transition-opacity ${
                              hasValue ? 'opacity-100' : 'opacity-40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full shadow-md ${
                                type === 'gold' ? 'bg-[#F59E0B] ring-2 ring-[#F59E0B]/30' :
                                type === 'silver' ? 'bg-[#9CA3AF] ring-2 ring-[#9CA3AF]/30' :
                                type === 'platinum' ? 'bg-[#6B7280] ring-2 ring-[#6B7280]/30' :
                                'bg-[#374151] ring-2 ring-[#374151]/30'
                              } ${!hasValue ? 'bg-gray-300 ring-0' : ''}`} />
                              <span className={`font-black capitalize text-lg ${
                                hasValue ? 'text-black' : 'text-gray-400'
                              }`}>{type}</span>
                            </div>
                            <div className="text-right">
                              <div className={`font-black text-lg ${
                                hasValue ? 'text-black' : 'text-gray-400'
                              }`}>${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <div className={`text-sm font-semibold mt-1 ${
                                hasValue ? 'text-gray-600' : 'text-gray-400'
                              }`}>{data.weight.toFixed(2)} oz</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory List */}
            <div className="bg-[#FEF3C7] rounded-3xl p-8 shadow-xl">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-black uppercase tracking-tight">Your Inventory</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportData}
                      className="hover:bg-gray-100 rounded-lg px-2 py-1 h-7 transition-colors"
                      title="Save JSON"
                    >
                      <Save className="h-3.5 w-3.5 text-gray-500 hover:text-black transition-colors" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleImportClick}
                      className="hover:bg-gray-100 rounded-lg px-2 py-1 h-7 transition-colors"
                      title="Load JSON"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-gray-500 hover:text-black transition-colors" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-[#EC4899] hover:bg-[#DB2777] text-white rounded-2xl px-8 py-3 font-black text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Metal
                </Button>
              </div>
                {metals.length === 0 ? (
                  <div className="text-center py-16">
                    <Coins className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-black mb-3 uppercase tracking-tight">No metals in your portfolio</h3>
                    <p className="text-gray-600 mb-6 font-semibold">Start tracking your precious metals collection</p>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#EC4899] hover:bg-[#DB2777] text-white rounded-2xl px-8 py-3 font-black text-sm uppercase tracking-wide shadow-lg">
                      Add Your First Metal
                    </Button>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metals.map((metal) => {
                      const currentValue = calculatePortfolioValue([metal], marketPrices).totalValue;
                      const purchaseCostOnly = metal.purchasePrice * metal.quantity;
                      const taxPaid = metal.purchaseTax || 0;
                      const totalCost = calculatePortfolioValue([metal], marketPrices).totalCost;
                      const gainLoss = currentValue - totalCost;
                      const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
                      const weightInOz = metal.weightUnit === 'oz' ? metal.weight : convertToOunces(metal.weight, metal.weightUnit);
                      const metalColors: Record<string, { bg: string; border: string; borderHover: string; ring: string }> = {
                        gold: { bg: 'bg-[#F59E0B]', border: 'border-[#F59E0B]/40', borderHover: 'hover:border-[#F59E0B]/60', ring: 'ring-[#F59E0B]/20' },
                        silver: { bg: 'bg-[#9CA3AF]', border: 'border-[#9CA3AF]/40', borderHover: 'hover:border-[#9CA3AF]/60', ring: 'ring-[#9CA3AF]/20' },
                        platinum: { bg: 'bg-[#6B7280]', border: 'border-[#6B7280]/40', borderHover: 'hover:border-[#6B7280]/60', ring: 'ring-[#6B7280]/20' },
                        palladium: { bg: 'bg-[#374151]', border: 'border-[#374151]/40', borderHover: 'hover:border-[#374151]/60', ring: 'ring-[#374151]/20' },
                      };
                      const colorScheme = metalColors[metal.type] || { bg: 'bg-gray-300', border: 'border-gray-300/40', borderHover: 'hover:border-gray-300/60', ring: 'ring-gray-300/20' };
                      return (
                        <div key={metal.id} className={`bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all border-2 ${colorScheme.border} ${colorScheme.borderHover} ${colorScheme.ring} hover:ring-2`}>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block w-5 h-5 rounded-full ${colorScheme.bg} shadow-md ring-2 ${colorScheme.ring}`}></span>
                              <div>
                                <h3 className="text-lg font-black capitalize text-black">{metal.type}</h3>
                                <p className="text-xs text-gray-500 font-semibold">Qty: {metal.quantity}</p>
                              </div>
                            </div>
                            <span className={`inline-block ${colorScheme.bg}/20 ${colorScheme.border} border rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide text-black`}>{metal.form}</span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-700 font-semibold mb-4 line-clamp-2">{metal.description || 'No description'}</p>
                          
                          {/* Key Metrics */}
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-semibold uppercase">Value</span>
                              <span className="text-lg font-black text-black">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={`flex justify-between items-center ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              <span className="text-xs font-semibold uppercase">P&L</span>
                              <span className="text-base font-black">{gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={`flex justify-between items-center ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              <span className="text-xs text-gray-500 font-semibold">Return</span>
                              <span className="text-sm font-bold">({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)</span>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-100 pt-3 mb-3">
                            <div>
                              <p className="text-gray-500 font-semibold mb-0.5 uppercase text-[10px]">Weight</p>
                              <p className="text-black font-bold">{metal.weight} {metal.weightUnit}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold mb-0.5 uppercase text-[10px]">Purity</p>
                              <p className="text-black font-bold">{(metal.purity * 100).toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold mb-0.5 uppercase text-[10px]">Date</p>
                              <p className="text-black font-semibold">{new Date(metal.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold mb-0.5 uppercase text-[10px]">Price/Unit</p>
                              <p className="text-black font-bold">${metal.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold mb-0.5 uppercase text-[10px]">Cost/Oz</p>
                              <p className="text-black font-bold">${(totalCost / (weightInOz * metal.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-semibold mb-0.5 uppercase text-[10px]">Total Weight</p>
                              <p className="text-black font-bold">{(weightInOz * metal.quantity).toFixed(2)} oz</p>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="space-y-0.5 mb-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-400 font-medium">Purchase Cost</span>
                              <span className="text-[10px] text-gray-600 font-medium">${purchaseCostOnly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {taxPaid > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-medium">Tax</span>
                                <span className="text-[10px] text-gray-600 font-medium">${taxPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-500 font-semibold">Total Cost</span>
                              <span className="text-[10px] text-gray-700 font-semibold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                            <Button variant="ghost" size="sm" onClick={() => handleEditMetal(metal)} className="hover:bg-[#EC4899]/10 rounded-lg px-2 py-1 h-7 transition-colors">
                              <Pencil className="h-3.5 w-3.5 text-gray-500 hover:text-[#EC4899] transition-colors" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMetal(metal.id)} className="hover:bg-red-50 rounded-lg px-2 py-1 h-7 transition-colors">
                              <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-600 transition-colors" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Import confirmation dialog */}
            <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Import Portfolio Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to import {importData?.length || 0} metal item(s). How would you like to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setImportData(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReplaceData} className="bg-red-600 hover:bg-red-700">
                    Replace All
                  </AlertDialogAction>
                  <AlertDialogAction onClick={handleMergeData} className="bg-[#EC4899] hover:bg-[#DB2777]">
                    Merge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Metal Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this metal item? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setMetalToDelete(null); }}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteMetal} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AddMetalDialog
              isOpen={isAddDialogOpen}
              onClose={() => { setIsAddDialogOpen(false); setEditMetal(null); }}
              onAdd={handleSaveMetal}
              {...(editMetal ? { initialData: editMetal } : {})}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
