import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  Filter,
  Download,
  Upload,
  TrendingUp,
  History,
  Building,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import pricingDatabase from '@/services/pricingDatabase';
import FormulaSettingsModal from '@/components/FormulaSettingsModal';

const MaterialPricingPanel = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [pricingData, setPricingData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFormulaSettings, setShowFormulaSettings] = useState(false);
  const [newItem, setNewItem] = useState({
    supplier: '',
    material: '',
    unitPrice: '',
    unit: 'sheets',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  // Common materials list (from your existing system)
  const commonMaterials = [
    { name: '5/8" drywall', unit: 'sheets', category: 'drywall' },
    { name: '1/2" drywall', unit: 'sheets', category: 'drywall' },
    { name: '3/8" drywall', unit: 'sheets', category: 'drywall' },
    { name: 'joint compound', unit: 'buckets', category: 'finishing' },
    { name: 'drywall screws', unit: 'pieces', category: 'fasteners' },
    { name: 'joint tape', unit: 'rolls', category: 'finishing' },
    { name: 'corner bead', unit: 'pcs', category: 'finishing' },
    { name: 'adhesives', unit: 'tubes', category: 'adhesives' },
    { name: 'R-13 insulation', unit: 'batts', category: 'insulation' },
    { name: 'R-19 insulation', unit: 'batts', category: 'insulation' },
    { name: 'vapor barrier', unit: 'rolls', category: 'moisture' },
    { name: 'caulk', unit: 'tubes', category: 'sealants' }
  ];

  const units = ['sheets', 'pieces', 'rolls', 'buckets', 'tubes', 'batts', 'pcs', 'gallons', 'lbs'];

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = () => {
    const data = pricingDatabase.exportPricingData();
    setPricingData(data);
  };

  const handleSavePricing = () => {
    if (!newItem.supplier || !newItem.material || !newItem.unitPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    pricingDatabase.updateSupplierPricing(
      newItem.supplier,
      newItem.material,
      parseFloat(newItem.unitPrice),
      newItem.unit
    );

    toast({
      title: "Price Updated! 💰",
      description: `${newItem.material} price for ${newItem.supplier} has been updated.`
    });

    setNewItem({
      supplier: '',
      material: '',
      unitPrice: '',
      unit: 'sheets',
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    loadPricingData();
  };

  const handleEditItem = (supplier, material, price, unit) => {
    setEditingItem({ supplier, material, price, unit });
    setNewItem({
      supplier,
      material,
      unitPrice: price.toString(),
      unit,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const handleDeleteItem = (supplier, material) => {
    if (confirm(`Are you sure you want to delete ${material} from ${supplier}?`)) {
      // Remove from supplier pricing
      if (pricingData.supplierPricing[supplier]) {
        delete pricingData.supplierPricing[supplier][material.toLowerCase()];
        pricingDatabase.importPricingData(pricingData);
        loadPricingData();
        
        toast({
          title: "Price Deleted",
          description: `${material} has been removed from ${supplier}.`
        });
      }
    }
  };

  const exportPricingData = () => {
    const data = pricingDatabase.exportPricingData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported! 📁",
      description: "Pricing data has been downloaded as JSON."
    });
  };

  const downloadCSVTemplate = () => {
    const template = `supplier,material,unit_price,unit,last_updated
ABC Supply Co,5/8" drywall,12.50,sheets,2024-01-25
ABC Supply Co,1/2" drywall,10.25,sheets,2024-01-25
ABC Supply Co,joint compound,18.75,buckets,2024-01-25
XYZ Materials,5/8" drywall,12.75,sheets,2024-01-25
XYZ Materials,drywall screws,0.16,pieces,2024-01-25`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded! 📋",
      description: "CSV template ready for supplier price list import."
    });
  };

  const importPricingData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Check if it's JSON or CSV
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(e.target.result);
          pricingDatabase.importPricingData(data);
          loadPricingData();
          
          toast({
            title: "JSON Data Imported! 📥",
            description: "Pricing data has been successfully imported."
          });
        } else if (file.name.endsWith('.csv')) {
          importCSVData(e.target.result);
        } else {
          throw new Error('Unsupported file format');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error.message || "Invalid file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const importCSVData = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected CSV format: supplier,material,unit_price,unit,last_updated
    const supplierIndex = headers.findIndex(h => h.includes('supplier'));
    const materialIndex = headers.findIndex(h => h.includes('material') || h.includes('description'));
    const priceIndex = headers.findIndex(h => h.includes('price') || h.includes('cost'));
    const unitIndex = headers.findIndex(h => h.includes('unit'));
    const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('updated'));

    if (supplierIndex === -1 || materialIndex === -1 || priceIndex === -1) {
      throw new Error('CSV must contain supplier, material, and price columns');
    }

    let importedCount = 0;
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      
      try {
        const supplier = values[supplierIndex];
        const material = values[materialIndex];
        const unitPrice = parseFloat(values[priceIndex]);
        const unit = values[unitIndex] || 'pcs';
        const lastUpdated = values[dateIndex] || new Date().toISOString().split('T')[0];

        if (supplier && material && !isNaN(unitPrice)) {
          pricingDatabase.updateSupplierPricing(supplier, material, unitPrice, unit);
          importedCount++;
        }
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error.message}`);
      }
    }

    loadPricingData();

    if (importedCount > 0) {
      toast({
        title: "CSV Import Successful! 📥",
        description: `Imported ${importedCount} pricing records.${errors.length > 0 ? ` ${errors.length} errors.` : ''}`
      });
    }

    if (errors.length > 0) {
      console.error('Import errors:', errors);
    }
  };

  const getFilteredSuppliers = () => {
    if (!pricingData) return [];
    
    const suppliers = Object.keys(pricingData.supplierPricing);
    if (selectedSupplier === 'all') return suppliers;
    return suppliers.filter(s => s === selectedSupplier);
  };

  const getFilteredMaterials = (supplier) => {
    if (!pricingData?.supplierPricing[supplier]) return [];
    
    const materials = Object.entries(pricingData.supplierPricing[supplier]);
    if (!searchTerm) return materials;
    
    return materials.filter(([material, price]) => 
      material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.unitPrice.toString().includes(searchTerm)
    );
  };

  const getPriceSourceColor = (source) => {
    switch (source) {
      case 'supplier_contract': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'historical_average': return 'text-green-600 bg-green-50 border-green-200';
      case 'market_reference': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriceSourceIcon = (source) => {
    switch (source) {
      case 'supplier_contract': return <Building className="h-4 w-4" />;
      case 'historical_average': return <History className="h-4 w-4" />;
      case 'market_reference': return <TrendingUp className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-green-800">Material Pricing Management</CardTitle>
                <p className="text-green-600 text-sm">Manage supplier pricing, historical data, and market references</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={downloadCSVTemplate} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
              <Button onClick={exportPricingData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file').click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json,.csv"
                onChange={importPricingData}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suppliers">Supplier Pricing</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
          <TabsTrigger value="market">Market Prices</TabsTrigger>
          <TabsTrigger value="analytics">Pricing Analytics</TabsTrigger>
          <TabsTrigger value="formulas">Formula Settings</TabsTrigger>
        </TabsList>

        {/* Supplier Pricing Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {pricingData && Object.keys(pricingData.supplierPricing).map(supplier => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Price
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {editingItem ? 'Edit Price' : 'Add New Price'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setNewItem({
                      supplier: '',
                      material: '',
                      unitPrice: '',
                      unit: 'sheets',
                      lastUpdated: new Date().toISOString().split('T')[0]
                    });
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Select value={newItem.material} onValueChange={(value) => setNewItem({...newItem, material: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMaterials.map(material => (
                          <SelectItem key={material.name} value={material.name}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Unit Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePricing}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Price
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplier Pricing Table */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredSuppliers().map(supplier => 
                    getFilteredMaterials(supplier).map(([material, price]) => (
                      <TableRow key={`${supplier}-${material}`}>
                        <TableCell className="font-medium">{supplier}</TableCell>
                        <TableCell>{material}</TableCell>
                        <TableCell>${price.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{price.unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{price.lastUpdated}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(supplier, material, price.unitPrice, price.unit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(supplier, material)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Data Tab */}
        <TabsContent value="historical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Price Averages</CardTitle>
              <p className="text-sm text-gray-600">Average prices from processed invoices</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Average Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Sample Size</TableHead>
                    <TableHead>Data Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingData?.historicalPricing && Object.entries(pricingData.historicalPricing).map(([material, data]) => (
                    <TableRow key={material}>
                      <TableCell className="font-medium">{material}</TableCell>
                      <TableCell>${data.avgPrice.toFixed(2)}</TableCell>
                      <TableCell>{data.unit}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{data.sampleSize} invoices</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={data.sampleSize > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {data.sampleSize > 10 ? 'Good' : 'Limited'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Prices Tab */}
        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Reference Prices</CardTitle>
              <p className="text-sm text-gray-600">Industry average prices for reference</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Market Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingData?.marketPricing && Object.entries(pricingData.marketPricing).map(([material, data]) => (
                    <TableRow key={material}>
                      <TableCell className="font-medium">{material}</TableCell>
                      <TableCell>${data.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{data.unit}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{data.source}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Supplier Contracts</p>
                    <p className="text-2xl font-bold">
                      {pricingData ? Object.keys(pricingData.supplierPricing).length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <History className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Historical Records</p>
                    <p className="text-2xl font-bold">
                      {pricingData ? Object.keys(pricingData.historicalPricing).length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Market References</p>
                    <p className="text-2xl font-bold">
                      {pricingData ? Object.keys(pricingData.marketPricing).length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Source Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingData && Object.entries(pricingData.supplierPricing).map(([supplier, materials]) => (
                  <div key={supplier} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{supplier}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(materials).map(([material, price]) => (
                        <div key={material} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{material}</span>
                          <Badge className={getPriceSourceColor('supplier_contract')}>
                            {getPriceSourceIcon('supplier_contract')}
                            <span className="ml-1">${price.unitPrice}</span>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formula Settings Tab */}
        <TabsContent value="formulas" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Accessory Calculation Formulas</CardTitle>
                <Button 
                  onClick={() => setShowFormulaSettings(true)}
                  className="bg-brandPrimary hover:bg-brandPrimary-600 text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Formula Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">About Formula Settings</h4>
                  <p className="text-sm text-blue-800">
                    These settings control how automatic accessory calculations are performed based on square footage. 
                    You can adjust rates, multipliers, and thresholds for different material types to match your 
                    specific project requirements and material usage patterns.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Joint Compound</h4>
                    <p className="text-sm text-gray-600">Base rates and multipliers for different finish types</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Fasteners</h4>
                    <p className="text-sm text-gray-600">Screw calculation rates per square footage</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Adhesives</h4>
                    <p className="text-sm text-gray-600">TiteBond and spray adhesive rates</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Tape</h4>
                    <p className="text-sm text-gray-600">Paper and mesh tape calculation settings</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Corner Bead</h4>
                    <p className="text-sm text-gray-600">Dependent material calculations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formula Settings Modal */}
      <FormulaSettingsModal
        isOpen={showFormulaSettings}
        onClose={() => setShowFormulaSettings(false)}
      />
    </div>
  );
};

export default MaterialPricingPanel; 