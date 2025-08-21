import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import inventoryService from '@/services/inventoryService';

const WarehouseTab = ({
  warehouseData,
  searchTerm,
  selectedCategory,
  categories,
  units,
  sources,
  onDataUpdate
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'pcs',
    location: '',
    category: 'materials',
    minStock: '',
    maxStock: '',
    source: 'purchased',
    notes: ''
  });

  const handleSaveItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingItem) {
        inventoryService.updateWarehouseItem(
          editingItem.category,
          editingItem.name,
          {
            ...newItem,
            quantity: parseFloat(newItem.quantity),
            minStock: parseFloat(newItem.minStock) || 0,
            maxStock: parseFloat(newItem.maxStock) || 0
          }
        );
        toast({
          title: "Item Updated",
          description: "Warehouse item has been updated successfully.",
        });
      } else {
        inventoryService.addWarehouseItem(newItem.category, {
          ...newItem,
          quantity: parseFloat(newItem.quantity),
          minStock: parseFloat(newItem.minStock) || 0,
          maxStock: parseFloat(newItem.maxStock) || 0
        });
        toast({
          title: "Item Added",
          description: "New warehouse item has been added successfully.",
        });
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      setNewItem({
        name: '',
        quantity: '',
        unit: 'pcs',
        location: '',
        category: 'materials',
        minStock: '',
        maxStock: '',
        source: 'purchased',
        notes: ''
      });
      onDataUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      location: item.location,
      category: item.category,
      minStock: item.minStock?.toString() || '',
      maxStock: item.maxStock?.toString() || '',
      source: item.source,
      notes: item.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteItem = (item) => {
    try {
      inventoryService.removeWarehouseItem(item.category, item.name);
      toast({
        title: "Item Deleted",
        description: "Warehouse item has been removed successfully.",
      });
      onDataUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setNewItem({
      name: '',
      quantity: '',
      unit: 'pcs',
      location: '',
      category: 'materials',
      minStock: '',
      maxStock: '',
      source: 'purchased',
      notes: ''
    });
  };

  // Filter and search items
  const filteredItems = warehouseData ? Object.entries(warehouseData)
    .flatMap(([category, itemsObj]) => {
      // Convert object to array if itemsObj is not an array
      const itemsArray = Array.isArray(itemsObj) ? itemsObj : Object.entries(itemsObj).map(([name, itemData]) => ({
        name,
        ...itemData,
        category
      }));
      
      return itemsArray.filter(item => 
        (selectedCategory === 'all' || item.category === selectedCategory) &&
        (searchTerm === '' || 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }) : [];

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Warehouse Inventory</h2>
          <p className="text-gray-600">Manage materials and supplies in your warehouse</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-brandPrimary hover:bg-brandPrimary-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="Enter storage location"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={newItem.source} onValueChange={(value) => setNewItem({ ...newItem, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source} value={source}>
                        {source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Minimum Stock</Label>
                <Input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                  placeholder="Alert threshold"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Stock</Label>
                <Input
                  type="number"
                  value={newItem.maxStock}
                  onChange={(e) => setNewItem({ ...newItem, maxStock: e.target.value })}
                  placeholder="Storage limit"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveItem} className="bg-brandPrimary hover:bg-brandPrimary-600 text-white">
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? 'Update' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={`${item.category}-${item.name}-${index}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{item.quantity} {item.unit}</span>
                      {item.quantity <= item.minStock && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    {item.quantity <= item.minStock ? (
                      <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                    ) : item.quantity >= item.maxStock ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Overstocked</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {item.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No inventory items found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseTab;
