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
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Package,
  Wrench,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AllocationsTab = ({ jobAllocations, jobs, searchTerm, selectedJob, onDataUpdate }) => {
  const [allocations, setAllocations] = useState(jobAllocations || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchAllocation, setSearchAllocation] = useState('');

  // Sample allocation types
  const allocationTypes = [
    { value: 'material', label: 'Material', icon: Package },
    { value: 'equipment', label: 'Equipment', icon: Wrench },
    { value: 'vehicle', label: 'Vehicle', icon: Truck },
    { value: 'tool', label: 'Tool', icon: Wrench },
    { value: 'supply', label: 'Supply', icon: Package }
  ];

  // Sample allocation statuses
  const allocationStatuses = [
    { value: 'allocated', label: 'Allocated', color: 'bg-blue-100 text-blue-800' },
    { value: 'in-transit', label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'on-site', label: 'On Site', color: 'bg-green-100 text-green-800' },
    { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-800' },
    { value: 'damaged', label: 'Damaged', color: 'bg-red-100 text-red-800' }
  ];

  // Filter allocations based on search and filters
  const filteredAllocations = useMemo(() => {
    // Ensure allocations is an array
    const allocationsArray = Array.isArray(allocations) ? allocations : [];
    
    return allocationsArray.filter(allocation => {
      const matchesSearch = allocation.name.toLowerCase().includes(searchAllocation.toLowerCase()) ||
                           allocation.description.toLowerCase().includes(searchAllocation.toLowerCase()) ||
                           allocation.jobName.toLowerCase().includes(searchAllocation.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || allocation.status === filterStatus;
      const matchesType = filterType === 'all' || allocation.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allocations, searchAllocation, filterStatus, filterType]);

  // Calculate allocation statistics
  const allocationStats = useMemo(() => {
    // Ensure allocations is an array
    const allocationsArray = Array.isArray(allocations) ? allocations : [];
    
    const total = allocationsArray.length;
    const allocated = allocationsArray.filter(a => a.status === 'allocated').length;
    const onSite = allocationsArray.filter(a => a.status === 'on-site').length;
    const inTransit = allocationsArray.filter(a => a.status === 'in-transit').length;
    const returned = allocationsArray.filter(a => a.status === 'returned').length;
    const overdue = allocationsArray.filter(a => {
      if (a.expectedReturnDate) {
        return new Date(a.expectedReturnDate) < new Date() && a.status !== 'returned';
      }
      return false;
    }).length;

    return { total, allocated, onSite, inTransit, returned, overdue };
  }, [allocations]);

  const addAllocation = (newAllocation) => {
    const allocation = {
      id: Date.now().toString(),
      ...newAllocation,
      createdAt: new Date().toISOString(),
      status: 'allocated'
    };
    
    setAllocations(prev => [...(Array.isArray(prev) ? prev : []), allocation]);
    setIsAddDialogOpen(false);
    toast({
      title: "Allocation Added",
      description: `${allocation.name} has been allocated to ${allocation.jobName}`,
    });
    
    if (onDataUpdate) {
      const currentAllocations = Array.isArray(allocations) ? allocations : [];
      onDataUpdate('allocations', [...currentAllocations, allocation]);
    }
  };

  const updateAllocationStatus = (allocationId, newStatus) => {
    setAllocations(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.map(allocation => 
        allocation.id === allocationId 
          ? { ...allocation, status: newStatus, updatedAt: new Date().toISOString() }
          : allocation
      );
    });
    
    toast({
      title: "Status Updated",
      description: "Allocation status has been updated successfully",
    });
  };

  const getStatusColor = (status) => {
    const statusObj = allocationStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const typeObj = allocationTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : Package;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{allocationStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Allocated</p>
                <p className="text-2xl font-bold">{allocationStats.allocated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">On Site</p>
                <p className="text-2xl font-bold">{allocationStats.onSite}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">{allocationStats.inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Returned</p>
                <p className="text-2xl font-bold">{allocationStats.returned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{allocationStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-600" />
              Job Allocations
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Allocation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Allocation</DialogTitle>
                  </DialogHeader>
                  <AddAllocationForm 
                    jobs={jobs} 
                    allocationTypes={allocationTypes}
                    onAdd={addAllocation}
                    onCancel={() => setIsAddDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search allocations..."
                  value={searchAllocation}
                  onChange={(e) => setSearchAllocation(e.target.value)}
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
                {allocationStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allocationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Allocations Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Allocated Date</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No allocations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllocations.map((allocation) => {
                    const TypeIcon = getTypeIcon(allocation.type);
                    return (
                      <TableRow key={allocation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{allocation.name}</div>
                            <div className="text-sm text-gray-500">{allocation.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <TypeIcon className="h-4 w-4 mr-2" />
                            {allocationTypes.find(t => t.value === allocation.type)?.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            {allocation.jobName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(allocation.status)}>
                            {allocationStatuses.find(s => s.value === allocation.status)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {allocation.allocatedDate ? new Date(allocation.allocatedDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {allocation.expectedReturnDate ? (
                            <div className={`flex items-center ${new Date(allocation.expectedReturnDate) < new Date() && allocation.status !== 'returned' ? 'text-red-600' : ''}`}>
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(allocation.expectedReturnDate).toLocaleDateString()}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={allocation.status} 
                            onValueChange={(value) => updateAllocationStatus(allocation.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allocationStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Allocation Form Component
const AddAllocationForm = ({ jobs, allocationTypes, onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'material',
    jobId: '',
    allocatedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    quantity: 1,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.jobId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const selectedJob = jobs.find(job => job.id === formData.jobId);
    
    onAdd({
      ...formData,
      jobName: selectedJob?.name || 'Unknown Job'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter item name"
        />
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allocationTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="jobId">Job *</Label>
        <Select value={formData.jobId} onValueChange={(value) => setFormData(prev => ({ ...prev, jobId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map(job => (
              <SelectItem key={job.id} value={job.id}>
                {job.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="allocatedDate">Allocated Date</Label>
          <Input
            id="allocatedDate"
            type="date"
            value={formData.allocatedDate}
            onChange={(e) => setFormData(prev => ({ ...prev, allocatedDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
          <Input
            id="expectedReturnDate"
            type="date"
            value={formData.expectedReturnDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
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
          Add Allocation
        </Button>
      </div>
    </form>
  );
};

export default AllocationsTab;
