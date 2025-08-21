import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, Package, Truck, Search, Filter, AlertTriangle, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import inventoryService from '@/services/inventoryService';
import WarehouseTab from './WarehouseTab';
import AllocationsTab from './AllocationsTab';
import AssetsTab from './AssetsTab';
import AnalyticsTab from './AnalyticsTab';
import { Button } from '@/components/ui/button';

const InventoryManagementPanel = ({ jobs = [] }) => {
  const [activeTab, setActiveTab] = useState('warehouse');
  const [warehouseData, setWarehouseData] = useState(null);
  const [assetData, setAssetData] = useState(null);
  const [jobAllocations, setJobAllocations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    try {
      setWarehouseData(inventoryService.getWarehouseInventory());
      setAssetData(inventoryService.getAssetTracking());
      setJobAllocations(inventoryService.getJobAllocations());
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load inventory data. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  const categories = ['materials', 'supplies'];
  const units = ['pcs', 'sheets', 'pieces', 'rolls', 'buckets', 'tubes', 'batts', 'gallons', 'lbs', 'kits'];
  const sources = ['purchased', 'leftover_from_jobs', 'returned', 'imported'];

  // Calculate summary statistics
  const totalItems = warehouseData ? Object.entries(warehouseData).reduce((total, [category, itemsObj]) => {
    const itemsArray = Array.isArray(itemsObj) ? itemsObj : Object.keys(itemsObj);
    return total + itemsArray.length;
  }, 0) : 0;
  
  const lowStockItems = warehouseData ? Object.entries(warehouseData).reduce((total, [category, itemsObj]) => {
    const itemsArray = Array.isArray(itemsObj) ? itemsObj : Object.entries(itemsObj).map(([name, itemData]) => ({
      name,
      ...itemData
    }));
    return total + itemsArray.filter(item => item.quantity <= item.minStock).length;
  }, 0) : 0;
  const activeAllocations = jobAllocations ? Object.keys(jobAllocations).length : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Warehouse className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Inventory Management</CardTitle>
                  <p className="text-white/80 mt-1">Warehouse, Assets & Material Tracking</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Total Items</p>
                <p className="font-semibold text-2xl">{totalItems}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Low Stock</p>
                <p className="font-semibold text-2xl">{lowStockItems}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Active Allocations</p>
                <p className="font-semibold text-2xl">{activeAllocations}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Active Jobs</p>
                <p className="font-semibold text-2xl">{jobs.filter(job => job.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Items</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Filter</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.filter(job => job.status === 'active').map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.jobName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={loadInventoryData}
                className="w-full bg-brandPrimary hover:bg-brandPrimary-600 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse" className="space-y-6">
          <WarehouseTab
            warehouseData={warehouseData}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            units={units}
            sources={sources}
            onDataUpdate={loadInventoryData}
          />
        </TabsContent>

        <TabsContent value="allocations" className="space-y-6">
          <AllocationsTab
            jobAllocations={jobAllocations}
            jobs={jobs}
            searchTerm={searchTerm}
            selectedJob={selectedJob}
            onDataUpdate={loadInventoryData}
          />
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <AssetsTab
            assetData={assetData}
            jobs={jobs}
            searchTerm={searchTerm}
            onDataUpdate={loadInventoryData}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab
            warehouseData={warehouseData}
            assetData={assetData}
            jobAllocations={jobAllocations}
            jobs={jobs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagementPanel;
