import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlusCircle, TrendingUp, Coins, DollarSign, Trash2, Pencil, Info, MoreVertical, LayoutGrid, Table2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddMetalDialog from '@/components/AddMetalDialog';
import PortfolioChart from '@/components/PortfolioChart';
import SettingsMenu from '@/components/SettingsMenu';
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState<MetalItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // View state management
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('stack-tracker-view-mode');
      return (saved === 'cards' || saved === 'table') ? saved : 'cards';
    } catch {
      return 'cards';
    }
  });
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Save metals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('stack-tracker-metals', JSON.stringify(metals));
    } catch (error) {
      console.error('Error saving metals to localStorage:', error);
    }
  }, [metals]);

  // Save view mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stack-tracker-view-mode', viewMode);
    } catch (error) {
      console.error('Error saving view mode to localStorage:', error);
    }
  }, [viewMode]);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

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

  // Sort metals for table view
  const sortedMetals = useMemo(() => {
    if (!sortColumn || viewMode !== 'table') {
      return metals;
    }

    const sorted = [...metals].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'form':
          aValue = a.form;
          bValue = b.form;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'weight':
          const aWeight = a.weightUnit === 'oz' ? a.weight : convertToOunces(a.weight, a.weightUnit);
          const bWeight = b.weightUnit === 'oz' ? b.weight : convertToOunces(b.weight, b.weightUnit);
          aValue = aWeight * a.quantity;
          bValue = bWeight * b.quantity;
          break;
        case 'purchasePrice':
          aValue = a.purchasePrice;
          bValue = b.purchasePrice;
          break;
        case 'value':
          if (!marketPrices) return 0;
          aValue = calculatePortfolioValue([a], marketPrices).totalValue;
          bValue = calculatePortfolioValue([b], marketPrices).totalValue;
          break;
        case 'pl':
          if (!marketPrices) return 0;
          const aCost = calculatePortfolioValue([a], marketPrices).totalCost;
          const bCost = calculatePortfolioValue([b], marketPrices).totalCost;
          aValue = calculatePortfolioValue([a], marketPrices).totalValue - aCost;
          bValue = calculatePortfolioValue([b], marketPrices).totalValue - bCost;
          break;
        case 'return':
          if (!marketPrices) return 0;
          const aCost2 = calculatePortfolioValue([a], marketPrices).totalCost;
          const bCost2 = calculatePortfolioValue([b], marketPrices).totalCost;
          const aValue2 = calculatePortfolioValue([a], marketPrices).totalValue;
          const bValue2 = calculatePortfolioValue([b], marketPrices).totalValue;
          aValue = aCost2 !== 0 ? ((aValue2 - aCost2) / aCost2) * 100 : 0;
          bValue = bCost2 !== 0 ? ((bValue2 - bCost2) / bCost2) * 100 : 0;
          break;
        case 'date':
          aValue = new Date(a.purchaseDate).getTime();
          bValue = new Date(b.purchaseDate).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return aValue - bValue;
    });

    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [metals, sortColumn, sortDirection, marketPrices, viewMode]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Only render main content if prices are loaded */}
        {isLoadingPrices || !marketPrices ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <svg className="animate-spin h-10 w-10 text-muted-foreground mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="text-lg text-muted-foreground">Loading live market data...</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Coins className="h-8 w-8 text-primary" />
                  <span>metals.cv</span>
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  a physical metals inventory utility
                  <Link to="/data-privacy">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Data Privacy & Storage Info"
                    >
                      <Info className="h-3 w-3" />
                    </Button>
                  </Link>
                </p>
              </div>
              
              {/* Right side: Live Prices */}
              <div className="flex flex-col items-end gap-3">
                {/* Live Market Prices Ticker */}
                <Card className="w-full md:w-auto">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>Live Prices{lastUpdated ? ` (last updated ${lastUpdated})` : ''}</span>
                    </div>
                    {isLoadingPrices || !marketPrices ? (
                      <div className="flex items-center gap-2 text-sm animate-pulse text-muted-foreground">
                        <span>Loading live prices...</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }}>
                          <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>AU</span>
                          <span className="font-mono text-sm font-semibold" style={{ color: '#F59E0B' }}>${marketPrices.gold.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: '#94A3B820', borderColor: '#94A3B8' }}>
                          <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>AG</span>
                          <span className="font-mono text-sm font-semibold" style={{ color: '#94A3B8' }}>${marketPrices.silver.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: '#64748B20', borderColor: '#64748B' }}>
                          <span className="text-xs font-medium" style={{ color: '#64748B' }}>PT</span>
                          <span className="font-mono text-sm font-semibold" style={{ color: '#64748B' }}>${marketPrices.platinum.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: '#47556920', borderColor: '#475569' }}>
                          <span className="text-xs font-medium" style={{ color: '#475569' }}>PD</span>
                          <span className="font-mono text-sm font-semibold" style={{ color: '#475569' }}>${marketPrices.palladium.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">${portfolioStats?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="flex items-center text-sm text-green-500 dark:text-green-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>Live pricing</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{portfolioStats?.totalItems}</div>
                  <div className="text-sm text-muted-foreground">Across {portfolioStats?.uniqueTypes} metal types</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{portfolioStats?.totalWeight.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Troy ounces</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold mb-2 ${portfolioStats?.unrealizedPL >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                    ${Math.abs(portfolioStats?.unrealizedPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-sm font-medium ${portfolioStats?.unrealizedPL >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                    {portfolioStats?.unrealizedPL >= 0 ? '+' : '-'}{((Math.abs(portfolioStats?.unrealizedPL) / portfolioStats?.totalCost) * 100).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Composition & Breakdown Combined */}
            <div className="mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                  <div className="w-full lg:w-1/2">
                    <PortfolioChart 
                      metals={metals} 
                      marketPrices={marketPrices}
                    />
                  </div>
                  <div className="w-full lg:w-1/2">
                      <h2 className="text-xl font-semibold mb-4">Breakdown</h2>
                      <div className="space-y-4">
                      {Object.entries(portfolioStats?.byType || {}).map(([type, data]) => {
                        const hasValue = data.value > 0 && data.weight > 0;
                        return (
                          <div 
                            key={type} 
                              className={`flex justify-between items-center py-3 border-b last:border-0 ${
                                hasValue ? '' : 'opacity-40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  type === 'gold' ? 'bg-amber-500' :
                                  type === 'silver' ? 'bg-slate-400' :
                                  type === 'platinum' ? 'bg-slate-600' :
                                  'bg-slate-700'
                                } ${!hasValue ? 'bg-muted' : ''}`} />
                                <span className={`font-medium capitalize ${
                                  hasValue ? 'text-foreground' : 'text-muted-foreground'
                              }`}>{type}</span>
                            </div>
                            <div className="text-right">
                                <div className={`font-semibold ${
                                  hasValue ? 'text-foreground' : 'text-muted-foreground'
                                }`}>${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className={`text-sm mt-1 ${
                                  hasValue ? 'text-muted-foreground' : 'text-muted-foreground'
                              }`}>{data.weight.toFixed(2)} oz</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Your Inventory</CardTitle>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                      size="sm"
                >
                      <PlusCircle className="h-4 w-4 mr-2" />
                  Add Metal
                </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'cards' | 'table')}>
                      <ToggleGroupItem value="cards" aria-label="Card view">
                        <LayoutGrid className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="table" aria-label="Table view">
                        <Table2 className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <SettingsMenu onExport={handleExportData} onImport={handleImportClick} />
                  </div>
              </div>
              </CardHeader>
              <CardContent>
                {metals.length === 0 ? (
                  <div className="text-center py-16">
                    <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No metals in your portfolio</h3>
                    <p className="text-muted-foreground mb-6">Start tracking your precious metals collection</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      Add Your First Metal
                    </Button>
                  </div>
                ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metals.map((metal) => {
                      const currentValue = calculatePortfolioValue([metal], marketPrices).totalValue;
                      const purchaseCostOnly = metal.purchasePrice * metal.quantity;
                      const taxPaid = metal.purchaseTax || 0;
                      const totalCost = calculatePortfolioValue([metal], marketPrices).totalCost;
                      const gainLoss = currentValue - totalCost;
                      const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
                      const weightInOz = metal.weightUnit === 'oz' ? metal.weight : convertToOunces(metal.weight, metal.weightUnit);
                      const metalColors: Record<string, string> = {
                        gold: 'bg-amber-500',
                        silver: 'bg-slate-400',
                        platinum: 'bg-slate-600',
                        palladium: 'bg-slate-700',
                      };
                      const dotColor = metalColors[metal.type] || 'bg-muted';
                      return (
                        <Card key={metal.id} className="hover:shadow-lg transition-all duration-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${dotColor}`}></span>
                                <div>
                                  <CardTitle className="text-lg capitalize">{metal.type}</CardTitle>
                                  <p className="text-xs text-muted-foreground">Qty: {metal.quantity}</p>
                                </div>
                              </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium capitalize">{metal.form}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditMetal(metal)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteMetal(metal.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                          {/* Description */}
                            {metal.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{metal.description}</p>
                            )}
                          
                          {/* Key Metrics */}
                            <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Value</span>
                                <span className="text-lg font-semibold">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                              <div className={`flex justify-between items-center ${gainLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                                <span className="text-sm text-muted-foreground">P&L</span>
                                <span className="font-semibold">{gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                              <div className={`flex justify-between items-center ${gainLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                                <span className="text-sm text-muted-foreground">Return</span>
                                <span className="text-sm font-medium">({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)</span>
                            </div>
                          </div>

                          {/* Details Grid */}
                            <div className="grid grid-cols-3 gap-2 text-xs border-t pt-3">
                              <div>
                                <p className="text-muted-foreground mb-1 text-[10px]">Weight</p>
                                <p className="font-medium">{metal.weight} {metal.weightUnit}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1 text-[10px]">Purity</p>
                                <p className="font-medium">{(metal.purity * 100).toFixed(2)}%</p>
                              </div>
                            <div>
                                <p className="text-muted-foreground mb-1 text-[10px]">Date</p>
                                <p className="font-medium">{new Date(metal.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1 text-[10px]">Price/Unit</p>
                                <p className="font-medium">${metal.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1 text-[10px]">Cost/Oz</p>
                                <p className="font-medium">${(totalCost / (weightInOz * metal.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1 text-[10px]">Total Weight</p>
                                <p className="font-medium">{(weightInOz * metal.quantity).toFixed(2)} oz</p>
                              </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-1 pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground">Purchase Cost</span>
                                <span className="text-[10px] font-medium">${purchaseCostOnly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              {taxPaid > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-muted-foreground">Tax</span>
                                  <span className="text-[10px] font-medium">${taxPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground font-medium">Total Cost</span>
                                <span className="text-[10px] font-semibold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('type')}>
                          <div className="flex items-center">
                            Type
                            {getSortIcon('type')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('description')}>
                          <div className="flex items-center">
                            Description
                            {getSortIcon('description')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('form')}>
                          <div className="flex items-center">
                            Form
                            {getSortIcon('form')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('quantity')}>
                          <div className="flex items-center">
                            Qty
                            {getSortIcon('quantity')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('weight')}>
                          <div className="flex items-center">
                            Weight
                            {getSortIcon('weight')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('purchasePrice')}>
                          <div className="flex items-center">
                            Price/Unit
                            {getSortIcon('purchasePrice')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('value')}>
                          <div className="flex items-center">
                            Value
                            {getSortIcon('value')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('pl')}>
                          <div className="flex items-center">
                            P&L
                            {getSortIcon('pl')}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('return')}>
                          <div className="flex items-center">
                            Return
                            {getSortIcon('return')}
                          </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMetals.map((metal) => {
                        const currentValue = calculatePortfolioValue([metal], marketPrices).totalValue;
                        const totalCost = calculatePortfolioValue([metal], marketPrices).totalCost;
                        const gainLoss = currentValue - totalCost;
                        const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
                        const weightInOz = metal.weightUnit === 'oz' ? metal.weight : convertToOunces(metal.weight, metal.weightUnit);
                        const metalColors: Record<string, string> = {
                          gold: 'bg-amber-500',
                          silver: 'bg-slate-400',
                          platinum: 'bg-slate-600',
                          palladium: 'bg-slate-700',
                        };
                        const dotColor = metalColors[metal.type] || 'bg-muted';
                        const handleRowClick = () => {
                          setSelectedMetal(metal);
                          setDetailModalOpen(true);
                        };
                        return (
                          <TableRow 
                            key={metal.id} 
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={handleRowClick}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${dotColor}`}></span>
                                <span className="capitalize font-medium">{metal.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{metal.description || '-'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium capitalize">
                                {metal.form}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{metal.quantity}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{(weightInOz * metal.quantity).toFixed(2)} oz</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">${metal.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${gainLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                                {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                                {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                              </span>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditMetal(metal)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteMetal(metal.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {selectedMetal && (() => {
                  const currentValue = calculatePortfolioValue([selectedMetal], marketPrices).totalValue;
                  const purchaseCostOnly = selectedMetal.purchasePrice * selectedMetal.quantity;
                  const taxPaid = selectedMetal.purchaseTax || 0;
                  const totalCost = calculatePortfolioValue([selectedMetal], marketPrices).totalCost;
                  const gainLoss = currentValue - totalCost;
                  const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
                  const weightInOz = selectedMetal.weightUnit === 'oz' ? selectedMetal.weight : convertToOunces(selectedMetal.weight, selectedMetal.weightUnit);
                  const metalColors: Record<string, string> = {
                    gold: 'bg-amber-500',
                    silver: 'bg-slate-400',
                    platinum: 'bg-slate-600',
                    palladium: 'bg-slate-700',
                  };
                  const dotColor = metalColors[selectedMetal.type] || 'bg-muted';
                  
                  return (
                    <>
                      <DialogHeader className="pb-4 border-b">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-block w-3 h-3 rounded-full ${dotColor}`}></span>
                            <div>
                              <DialogTitle className="text-xl capitalize mb-1">{selectedMetal.type}</DialogTitle>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>Qty: {selectedMetal.quantity}</span>
                                <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium capitalize text-xs">
                                  {selectedMetal.form}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogHeader>
                      
                      <div className="space-y-6 pt-4">
                        {/* Description with Edit Button */}
                        <div className="flex items-start justify-between gap-4">
                          {selectedMetal.description ? (
                            <p className="text-sm text-muted-foreground flex-1">{selectedMetal.description}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground flex-1 italic">No description</p>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  handleEditMetal(selectedMetal);
                                  setDetailModalOpen(false);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  handleDeleteMetal(selectedMetal.id);
                                  setDetailModalOpen(false);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
            </div>
                        
                        {/* Key Metrics - Prominent Display */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Value</p>
                            <p className="text-xl font-semibold">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">P&L</p>
                            <p className={`text-xl font-semibold ${gainLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                              {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Return</p>
                            <p className={`text-xl font-semibold ${gainLoss >= 0 ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                              {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Weight</p>
                            <p className="text-sm font-medium">{selectedMetal.weight} {selectedMetal.weightUnit}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Purity</p>
                            <p className="text-sm font-medium">{(selectedMetal.purity * 100).toFixed(2)}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Purchase Date</p>
                            <p className="text-sm font-medium">{new Date(selectedMetal.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Price/Unit</p>
                            <p className="text-sm font-medium">${selectedMetal.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Cost/Oz</p>
                            <p className="text-sm font-medium">${(totalCost / (weightInOz * selectedMetal.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Total Weight</p>
                            <p className="text-sm font-medium">{(weightInOz * selectedMetal.quantity).toFixed(2)} oz</p>
                          </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="pt-4 border-t">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Purchase Cost</span>
                              <span className="text-sm font-medium">${purchaseCostOnly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            {taxPaid > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tax</span>
                                <span className="text-sm font-medium">${taxPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-sm font-semibold">Total Cost</span>
                              <span className="text-sm font-semibold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </DialogContent>
            </Dialog>

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
                  <AlertDialogAction onClick={handleReplaceData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Replace All
                  </AlertDialogAction>
                  <AlertDialogAction onClick={handleMergeData}>
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
                  <AlertDialogAction onClick={confirmDeleteMetal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
