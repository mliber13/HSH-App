import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Truck,
  HardHat,
  Settings,
  FileText,
  Camera,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AssetsTab = ({ assetData, jobs, searchTerm, onDataUpdate }) => {
  const [assets, setAssets] = useState(assetData || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchAsset, setSearchAsset] = useState('');

  // Asset categories
  const assetCategories = [
    { value: 'equipment', label: 'Equipment', icon: Settings },
    { value: 'tools', label: 'Tools', icon: Wrench },
    { value: 'vehicles', label: 'Vehicles', icon: Truck },
    { value: 'electronics', label: 'Electronics', icon: Monitor },
    { value: 'safety', label: 'Safety Gear', icon: HardHat },
    { value: 'office', label: 'Office Equipment', icon: FileText }
  ];

  // Asset statuses
  const assetStatuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'retired', label: 'Retired', color: 'bg-gray-100 text-gray-800' },
    { value: 'lost', label: 'Lost/Stolen', color: 'bg-red-100 text-red-800' },
    { value: 'repair', label: 'In Repair', color: 'bg-orange-100 text-orange-800' }
  ];

  // Asset locations
  const assetLocations = [
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'office', label: 'Office' },
    { value: 'job-site', label: 'Job Site' },
    { value: 'vehicle', label: 'In Vehicle' },
    { value: 'maintenance', label: 'Maintenance Shop' },
    { value: 'storage', label: 'Storage Unit' }
  ];

  // Filter assets based on search and filters
  const filteredAssets = useMemo(() => {
    // Ensure assets is an array
    const assetsArray = Array.isArray(assets) ? assets : [];
    
    return assetsArray.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchAsset.toLowerCase()) ||
                           asset.description.toLowerCase().includes(searchAsset.toLowerCase()) ||
                           asset.assetTag.toLowerCase().includes(searchAsset.toLowerCase()) ||
                           asset.serialNumber.toLowerCase().includes(searchAsset.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
      const matchesLocation = filterLocation === 'all' || asset.location === filterLocation;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [assets, searchAsset, filterStatus, filterCategory, filterLocation]);

  // Calculate asset statistics
  const assetStats = useMemo(() => {
    // Ensure assets is an array
    const assetsArray = Array.isArray(assets) ? assets : [];
    
    const total = assetsArray.length;
    const active = assetsArray.filter(a => a.status === 'active').length;
    const maintenance = assetsArray.filter(a => a.status === 'maintenance').length;
    const retired = assetsArray.filter(a => a.status === 'retired').length;
    const totalValue = assetsArray.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
    const overdueMaintenance = assetsArray.filter(asset => {
      if (asset.nextMaintenanceDate) {
        return new Date(asset.nextMaintenanceDate) < new Date() && asset.status !== 'retired';
      }
      return false;
    }).length;

    return { total, active, maintenance, retired, totalValue, overdueMaintenance };
  }, [assets]);

  const addAsset = (newAsset) => {
    const asset = {
      id: Date.now().toString(),
      ...newAsset,
      createdAt: new Date().toISOString(),
      status: 'active',
      currentValue: newAsset.purchasePrice || 0
    };
    
    setAssets(prev => [...(Array.isArray(prev) ? prev : []), asset]);
    setIsAddDialogOpen(false);
    toast({
      title: "Asset Added",
      description: `${asset.name} has been added to the asset registry`,
    });
    
    if (onDataUpdate) {
      const currentAssets = Array.isArray(assets) ? assets : [];
      onDataUpdate('assets', [...currentAssets, asset]);
    }
  };

  const updateAsset = (updatedAsset) => {
    setAssets(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.map(asset => 
        asset.id === updatedAsset.id 
          ? { ...asset, ...updatedAsset, updatedAt: new Date().toISOString() }
          : asset
      );
    });
    
    setIsEditDialogOpen(false);
    setEditingAsset(null);
    toast({
      title: "Asset Updated",
      description: `${updatedAsset.name} has been updated successfully`,
    });
  };

  const deleteAsset = (assetId) => {
    const assetsArray = Array.isArray(assets) ? assets : [];
    const asset = assetsArray.find(a => a.id === assetId);
    setAssets(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.filter(a => a.id !== assetId);
    });
    
    toast({
      title: "Asset Removed",
      description: `${asset?.name} has been removed from the asset registry`,
    });
  };

  const getStatusColor = (status) => {
    const statusObj = assetStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const categoryObj = assetCategories.find(c => c.value === category);
    return categoryObj ? categoryObj.icon : Package;
  };

  const calculateDepreciation = (asset) => {
    if (!asset.purchasePrice || !asset.purchaseDate) return asset.currentValue || 0;
    
    const purchaseDate = new Date(asset.purchaseDate);
    const today = new Date();
    const yearsOwned = (today - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
    const depreciationRate = asset.depreciationRate || 0.1; // 10% per year default
    
    const depreciatedValue = asset.purchasePrice * Math.pow(1 - depreciationRate, yearsOwned);
    return Math.max(depreciatedValue, asset.salvageValue || 0);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold">{assetStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{assetStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold">{assetStats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{assetStats.overdueMaintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${assetStats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Retired</p>
                <p className="text-2xl font-bold">{assetStats.retired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-green-600" />
              Asset Tracking
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                  </DialogHeader>
                  <AddAssetForm 
                    assetCategories={assetCategories}
                    assetLocations={assetLocations}
                    onAdd={addAsset}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Asset List</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search assets..."
                      value={searchAsset}
                      onChange={(e) => setSearchAsset(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {assetStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {assetCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {assetLocations.map(location => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assets Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No assets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => {
                        const CategoryIcon = getCategoryIcon(asset.category);
                        const currentValue = calculateDepreciation(asset);
                        return (
                          <TableRow key={asset.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-sm text-gray-500">
                                  {asset.assetTag} • {asset.serialNumber}
                                </div>
                                <div className="text-xs text-gray-400">{asset.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CategoryIcon className="h-4 w-4 mr-2" />
                                {assetCategories.find(c => c.value === asset.category)?.label}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(asset.status)}>
                                {assetStatuses.find(s => s.value === asset.status)?.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {assetLocations.find(l => l.value === asset.location)?.label}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">${currentValue.toLocaleString()}</div>
                                {asset.purchasePrice && (
                                  <div className="text-xs text-gray-500">
                                    Original: ${asset.purchasePrice.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {asset.nextMaintenanceDate ? (
                                <div className={`flex items-center ${new Date(asset.nextMaintenanceDate) < new Date() ? 'text-red-600' : ''}`}>
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingAsset(asset);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteAsset(asset.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance" className="space-y-4">
              <MaintenanceSchedule assets={assets} onUpdateAsset={updateAsset} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          {editingAsset && (
            <EditAssetForm 
              asset={editingAsset}
              assetCategories={assetCategories}
              assetLocations={assetLocations}
              assetStatuses={assetStatuses}
              onUpdate={updateAsset}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingAsset(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Asset Form Component
const AddAssetForm = ({ assetCategories, assetLocations, onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'equipment',
    assetTag: '',
    serialNumber: '',
    location: 'warehouse',
    purchasePrice: '',
    purchaseDate: '',
    depreciationRate: 0.1,
    salvageValue: '',
    nextMaintenanceDate: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.assetTag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      salvageValue: parseFloat(formData.salvageValue) || 0,
      depreciationRate: parseFloat(formData.depreciationRate) || 0.1
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter asset name"
          />
        </div>
        
        <div>
          <Label htmlFor="assetTag">Asset Tag *</Label>
          <Input
            id="assetTag"
            value={formData.assetTag}
            onChange={(e) => setFormData(prev => ({ ...prev, assetTag: e.target.value }))}
            placeholder="e.g., ASSET-001"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assetCategories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
            placeholder="Enter serial number"
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assetLocations.map(location => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
          <Input
            id="depreciationRate"
            type="number"
            step="0.01"
            value={formData.depreciationRate * 100}
            onChange={(e) => setFormData(prev => ({ ...prev, depreciationRate: parseFloat(e.target.value) / 100 }))}
            placeholder="10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salvageValue">Salvage Value</Label>
          <Input
            id="salvageValue"
            type="number"
            step="0.01"
            value={formData.salvageValue}
            onChange={(e) => setFormData(prev => ({ ...prev, salvageValue: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
          <Input
            id="nextMaintenanceDate"
            type="date"
            value={formData.nextMaintenanceDate}
            onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Asset
        </Button>
      </div>
    </form>
  );
};

// Edit Asset Form Component
const EditAssetForm = ({ asset, assetCategories, assetLocations, assetStatuses, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    ...asset,
    purchasePrice: asset.purchasePrice?.toString() || '',
    salvageValue: asset.salvageValue?.toString() || '',
    depreciationRate: (asset.depreciationRate || 0.1) * 100
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.assetTag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onUpdate({
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      salvageValue: parseFloat(formData.salvageValue) || 0,
      depreciationRate: parseFloat(formData.depreciationRate) / 100 || 0.1
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter asset name"
          />
        </div>
        
        <div>
          <Label htmlFor="assetTag">Asset Tag *</Label>
          <Input
            id="assetTag"
            value={formData.assetTag}
            onChange={(e) => setFormData(prev => ({ ...prev, assetTag: e.target.value }))}
            placeholder="e.g., ASSET-001"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assetCategories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assetStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
            placeholder="Enter serial number"
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assetLocations.map(location => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
          <Input
            id="depreciationRate"
            type="number"
            step="0.01"
            value={formData.depreciationRate}
            onChange={(e) => setFormData(prev => ({ ...prev, depreciationRate: parseFloat(e.target.value) }))}
            placeholder="10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salvageValue">Salvage Value</Label>
          <Input
            id="salvageValue"
            type="number"
            step="0.01"
            value={formData.salvageValue}
            onChange={(e) => setFormData(prev => ({ ...prev, salvageValue: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
          <Input
            id="nextMaintenanceDate"
            type="date"
            value={formData.nextMaintenanceDate}
            onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Asset
        </Button>
      </div>
    </form>
  );
};

// Maintenance Schedule Component
const MaintenanceSchedule = ({ assets, onUpdateAsset }) => {
  // Ensure assets is an array
  const assetsArray = Array.isArray(assets) ? assets : [];
  
  const maintenanceAssets = assetsArray.filter(asset => 
    asset.nextMaintenanceDate && asset.status !== 'retired'
  ).sort((a, b) => new Date(a.nextMaintenanceDate) - new Date(b.nextMaintenanceDate));

  const overdueAssets = maintenanceAssets.filter(asset => 
    new Date(asset.nextMaintenanceDate) < new Date()
  );

  const upcomingAssets = maintenanceAssets.filter(asset => 
    new Date(asset.nextMaintenanceDate) >= new Date()
  );

  const markMaintenanceComplete = (assetId) => {
    const asset = assetsArray.find(a => a.id === assetId);
    if (asset) {
      // Set next maintenance date to 6 months from now
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 6);
      
      onUpdateAsset({
        ...asset,
        status: 'active',
        nextMaintenanceDate: nextDate.toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overdue Maintenance */}
      {overdueAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Overdue Maintenance ({overdueAssets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => markMaintenanceComplete(asset.id)}
                  >
                    Mark Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Maintenance ({upcomingAssets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAssets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming maintenance scheduled</p>
            ) : (
              upcomingAssets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markMaintenanceComplete(asset.id)}
                  >
                    Mark Complete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsTab;
