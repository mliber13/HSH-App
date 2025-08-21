import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  Building,
  Wrench,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AnalyticsTab = ({ inventoryData, allocations, assets, jobs, searchTerm, onDataUpdate }) => {
  const [timeRange, setTimeRange] = useState('30-days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Sample inventory data structure
  const inventory = useMemo(() => {
    return inventoryData || [
      {
        id: '1',
        name: 'Drywall Sheets',
        category: 'materials',
        location: 'warehouse',
        quantity: 150,
        minQuantity: 50,
        maxQuantity: 200,
        unitCost: 12.50,
        totalValue: 1875,
        lastUpdated: '2024-01-15',
        supplier: 'ABC Supply',
        reorderPoint: 75,
        leadTime: 3
      },
      {
        id: '2',
        name: 'Screws (1-5/8")',
        category: 'fasteners',
        location: 'warehouse',
        quantity: 5000,
        minQuantity: 1000,
        maxQuantity: 10000,
        unitCost: 0.15,
        totalValue: 750,
        lastUpdated: '2024-01-14',
        supplier: 'Fastener Co',
        reorderPoint: 2000,
        leadTime: 2
      },
      {
        id: '3',
        name: 'Joint Compound',
        category: 'materials',
        location: 'warehouse',
        quantity: 25,
        minQuantity: 10,
        maxQuantity: 50,
        unitCost: 18.00,
        totalValue: 450,
        lastUpdated: '2024-01-13',
        supplier: 'ABC Supply',
        reorderPoint: 15,
        leadTime: 5
      }
    ];
  }, [inventoryData]);

  // Calculate analytics based on filters
  const analytics = useMemo(() => {
    const filteredInventory = inventory.filter(item => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
      return matchesCategory && matchesLocation;
    });

    // Total inventory value
    const totalValue = filteredInventory.reduce((sum, item) => sum + item.totalValue, 0);
    
    // Items that need reordering
    const needsReorder = filteredInventory.filter(item => item.quantity <= item.reorderPoint);
    const reorderValue = needsReorder.reduce((sum, item) => sum + (item.maxQuantity - item.quantity) * item.unitCost, 0);
    
    // Low stock items
    const lowStock = filteredInventory.filter(item => item.quantity <= item.minQuantity);
    
    // Overstock items
    const overstock = filteredInventory.filter(item => item.quantity >= item.maxQuantity * 0.9);
    
    // Category breakdown
    const categoryBreakdown = filteredInventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0 };
      }
      acc[item.category].count++;
      acc[item.category].value += item.totalValue;
      return acc;
    }, {});
    
    // Location breakdown
    const locationBreakdown = filteredInventory.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = { count: 0, value: 0 };
      }
      acc[item.location].count++;
      acc[item.location].value += item.totalValue;
      return acc;
    }, {});
    
    // Turnover analysis (simplified)
    const turnoverAnalysis = filteredInventory.map(item => {
      const utilization = (item.quantity / item.maxQuantity) * 100;
      const daysSinceUpdate = Math.floor((new Date() - new Date(item.lastUpdated)) / (1000 * 60 * 60 * 24));
      
      return {
        ...item,
        utilization,
        daysSinceUpdate,
        turnoverRate: utilization > 80 ? 'High' : utilization > 50 ? 'Medium' : 'Low'
      };
    });

    return {
      totalItems: filteredInventory.length,
      totalValue,
      needsReorder: needsReorder.length,
      reorderValue,
      lowStock: lowStock.length,
      overstock: overstock.length,
      categoryBreakdown,
      locationBreakdown,
      turnoverAnalysis,
      filteredInventory
    };
  }, [inventory, categoryFilter, locationFilter]);

  // Generate sample chart data
  const chartData = useMemo(() => {
    const categories = Object.keys(analytics.categoryBreakdown);
    const locations = Object.keys(analytics.locationBreakdown);
    
    return {
      categoryChart: categories.map(category => ({
        name: category,
        value: analytics.categoryBreakdown[category].value,
        count: analytics.categoryBreakdown[category].count
      })),
      locationChart: locations.map(location => ({
        name: location,
        value: analytics.locationBreakdown[location].value,
        count: analytics.locationBreakdown[location].count
      })),
      turnoverChart: analytics.turnoverAnalysis.slice(0, 10).map(item => ({
        name: item.name,
        utilization: item.utilization,
        turnoverRate: item.turnoverRate
      }))
    };
  }, [analytics]);

  const exportReport = () => {
    // Generate CSV data
    const csvData = analytics.filteredInventory.map(item => ({
      Name: item.name,
      Category: item.category,
      Location: item.location,
      Quantity: item.quantity,
      'Unit Cost': item.unitCost,
      'Total Value': item.totalValue,
      'Reorder Point': item.reorderPoint,
      'Last Updated': item.lastUpdated
    }));
    
    // Convert to CSV string
    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'text-green-600';
    if (utilization >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTurnoverColor = (rate) => {
    switch (rate) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your inventory performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-days">Last 7 Days</SelectItem>
              <SelectItem value="30-days">Last 30 Days</SelectItem>
              <SelectItem value="90-days">Last 90 Days</SelectItem>
              <SelectItem value="1-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{analytics.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${analytics.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Need Reorder</p>
                <p className="text-2xl font-bold">{analytics.needsReorder}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Reorder Value</p>
                <p className="text-2xl font-bold">${analytics.reorderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="turnover">Turnover</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
                <SelectItem value="fasteners">Fasteners</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="job-site">Job Site</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Low Stock Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Low Stock Items ({analytics.lowStock})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.filteredInventory
                    .filter(item => item.quantity <= item.minQuantity)
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} / {item.minQuantity} units
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      </div>
                    ))}
                  {analytics.lowStock === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">No low stock items</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items Needing Reorder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  <Clock className="h-5 w-5 mr-2" />
                  Need Reorder ({analytics.needsReorder})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.filteredInventory
                    .filter(item => item.quantity <= item.reorderPoint && item.quantity > item.minQuantity)
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border border-yellow-200 rounded bg-yellow-50">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} / {item.reorderPoint} units
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Reorder
                        </Badge>
                      </div>
                    ))}
                  {analytics.needsReorder === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">No items need reordering</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overstock Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Overstock ({analytics.overstock})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.filteredInventory
                    .filter(item => item.quantity >= item.maxQuantity * 0.9)
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border border-orange-200 rounded bg-orange-50">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            {item.quantity} / {item.maxQuantity} units
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Overstock
                        </Badge>
                      </div>
                    ))}
                  {analytics.overstock === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">No overstock items</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.filteredInventory.map((item) => {
                      const utilization = (item.quantity / item.maxQuantity) * 100;
                      const isLowStock = item.quantity <= item.minQuantity;
                      const needsReorder = item.quantity <= item.reorderPoint && !isLowStock;
                      const isOverstock = item.quantity >= item.maxQuantity * 0.9;
                      
                      let status = 'Normal';
                      let statusColor = 'bg-green-100 text-green-800';
                      
                      if (isLowStock) {
                        status = 'Critical';
                        statusColor = 'bg-red-100 text-red-800';
                      } else if (needsReorder) {
                        status = 'Reorder';
                        statusColor = 'bg-yellow-100 text-yellow-800';
                      } else if (isOverstock) {
                        status = 'Overstock';
                        statusColor = 'bg-orange-100 text-orange-800';
                      }
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.supplier}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {item.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.quantity}</div>
                              <div className="text-sm text-gray-500">
                                Min: {item.minQuantity} | Max: {item.maxQuantity}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">${item.totalValue.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">
                                ${item.unitCost}/unit
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColor}>{status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={utilization} className="w-16" />
                              <span className={`text-sm ${getUtilizationColor(utilization)}`}>
                                {utilization.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="turnover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Turnover Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Turnover Rate</TableHead>
                      <TableHead>Days Since Update</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.turnoverChart.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Materials</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={item.utilization} className="w-16" />
                            <span className={`text-sm ${getUtilizationColor(item.utilization)}`}>
                              {item.utilization.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`text-sm ${getTurnoverColor(item.turnoverRate)}`}>
                              {item.turnoverRate}
                            </span>
                            {item.turnoverRate === 'High' && <ArrowUpRight className="h-4 w-4 ml-1 text-green-600" />}
                            {item.turnoverRate === 'Low' && <ArrowDownRight className="h-4 w-4 ml-1 text-red-600" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {Math.floor(Math.random() * 30) + 1} days
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.utilization >= 80 ? (
                            <Badge className="bg-green-100 text-green-800">Increase Stock</Badge>
                          ) : item.utilization <= 20 ? (
                            <Badge className="bg-red-100 text-red-800">Reduce Stock</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Monitor</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.categoryChart.map((category) => {
                    const percentage = (category.value / analytics.totalValue) * 100;
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{category.name}</span>
                          <span className="text-sm text-gray-600">
                            ${category.value.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="w-full" />
                        <div className="text-xs text-gray-500">
                          {category.count} items
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.categoryChart.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{category.name}</div>
                        <div className="text-sm text-gray-600">{category.count} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${category.value.toLocaleString()}</div>
                        <div className="text-sm text-green-600">+12.5%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Location Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.locationChart.map((location) => {
                    const percentage = (location.value / analytics.totalValue) * 100;
                    return (
                      <div key={location.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{location.name}</span>
                          <span className="text-sm text-gray-600">
                            ${location.value.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="w-full" />
                        <div className="text-xs text-gray-500">
                          {location.count} items
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Location Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Location Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.locationChart.map((location) => (
                    <div key={location.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.count} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${location.value.toLocaleString()}</div>
                        <div className="text-sm text-green-600">85% efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
