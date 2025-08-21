import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Bell,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import supplierService from '@/services/supplierService';
import DeliveryConfirmationModal from '@/components/DeliveryConfirmationModal';

const SupplierManagementPanel = ({ jobs = [] }) => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [takeoffRequests, setTakeoffRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedTakeoffRequest, setSelectedTakeoffRequest] = useState(null);
  
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    materialCategories: [],
    deliveryPreferences: '',
    isPrimary: false
  });

  const materialCategories = supplierService.getMaterialCategories();

  useEffect(() => {
    loadSupplierData();
  }, []);

  useEffect(() => {
    try {
      if (selectedJob && selectedJob !== 'all') {
        setTakeoffRequests(supplierService.getTakeoffRequests(selectedJob));
      } else {
        setTakeoffRequests(supplierService.getTakeoffRequests());
      }
    } catch (error) {
      console.error('Error loading takeoff requests:', error);
      setTakeoffRequests([]);
    }
  }, [selectedJob]);

  const loadSupplierData = () => {
    try {
      setSuppliers(supplierService.getSuppliers());
      setTakeoffRequests(supplierService.getTakeoffRequests());
      setDeliveries(supplierService.getDeliveries());
    } catch (error) {
      console.error('Error loading supplier data:', error);
      setSuppliers([]);
      setTakeoffRequests([]);
      setDeliveries([]);
    }
  };

  const handleSaveSupplier = () => {
    if (!newSupplier.name || !newSupplier.contactPerson || !newSupplier.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      supplierService.addSupplier(newSupplier);
      toast({
        title: "Supplier Added! 🏢",
        description: `${newSupplier.name} has been added to your suppliers.`
      });

      setNewSupplier({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        materialCategories: [],
        deliveryPreferences: '',
        isPrimary: false
      });
      setShowAddSupplierForm(false);
      loadSupplierData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelivery = (takeoffRequest) => {
    setSelectedTakeoffRequest(takeoffRequest);
    setShowDeliveryModal(true);
  };

  const handleDeliveryConfirmed = (result) => {
    loadSupplierData();
    toast({
      title: "Delivery Confirmed! 🎉",
      description: `Office has been notified of delivery for ${result.delivery.jobName}.`
    });
  };





  const pendingDeliveries = (() => {
    try {
      return supplierService.getPendingDeliveries();
    } catch (error) {
      console.error('Error getting pending deliveries:', error);
      return [];
    }
  })();
  
  const recentDeliveries = (() => {
    try {
      return supplierService.getRecentDeliveries(5);
    } catch (error) {
      console.error('Error getting recent deliveries:', error);
      return [];
    }
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-800">Supplier Management</CardTitle>
                <p className="text-blue-600 text-sm">Manage suppliers, send takeoffs, and track deliveries</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {pendingDeliveries.length > 0 && (
                <Badge className="text-red-600 bg-red-50 border-red-200">
                  <Bell className="h-4 w-4 mr-1" />
                  {pendingDeliveries.length} Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="font-semibold text-2xl">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Send className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Deliveries</p>
                <p className="font-semibold text-2xl">{pendingDeliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Recent Deliveries</p>
                <p className="font-semibold text-2xl">{recentDeliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="font-semibold text-2xl">{deliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

             {/* Main Content */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
         <TabsList className="grid w-full grid-cols-3">
           <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
           <TabsTrigger value="takeoffs">Takeoff Requests</TabsTrigger>
           <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
         </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Suppliers</CardTitle>
                <Button onClick={() => setShowAddSupplierForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {suppliers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Materials</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{supplier.name}</span>
                            {supplier.isPrimary && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{supplier.phone}</span>
                            </div>
                            {supplier.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{supplier.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {supplier.materialCategories.length > 0 
                              ? supplier.materialCategories.join(', ')
                              : 'All materials'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={supplier.isActive ? 'text-green-600 border-green-300' : 'text-gray-600 border-gray-300'}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No suppliers found. Add your first supplier to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

                 {/* Takeoff Requests Tab */}
         <TabsContent value="takeoffs" className="space-y-6">
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <CardTitle>Takeoff Requests</CardTitle>
                 <div className="flex items-center space-x-2">
                                       <Select value={selectedJob} onValueChange={setSelectedJob}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by job" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {jobs.map(job => (
                          <SelectItem key={job.id} value={job.id}>{job.jobName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
               </div>
             </CardHeader>
             <CardContent>
               {takeoffRequests && takeoffRequests.length > 0 ? (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Job</TableHead>
                       <TableHead>Supplier</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Sent Date</TableHead>
                       <TableHead>Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {takeoffRequests.map((request) => (
                       <TableRow key={request.id}>
                         <TableCell className="font-medium">{request.jobName || 'Unknown Job'}</TableCell>
                         <TableCell>{request.supplierName || 'Unknown Supplier'}</TableCell>
                         <TableCell>
                           <Badge className={request.status === 'delivered' ? 'text-green-600 bg-green-50 border-green-200' : 'text-yellow-600 bg-yellow-50 border-yellow-200'}>
                             {request.status === 'delivered' ? 'Delivered' : 'Pending'}
                           </Badge>
                         </TableCell>
                         <TableCell>
                           {request.sentAt ? new Date(request.sentAt).toLocaleDateString() : 'Unknown'}
                         </TableCell>
                         <TableCell>
                           {request.status === 'sent' && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleConfirmDelivery(request)}
                               className="text-green-600 border-green-300 hover:bg-green-50"
                             >
                               <CheckCircle className="h-4 w-4 mr-1" />
                               Confirm Delivery
                             </Button>
                           )}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               ) : (
                 <div className="text-center py-8">
                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-600">No takeoff requests found.</p>
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Materials</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.slice(0, 20).map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.jobName}</TableCell>
                        <TableCell>{delivery.supplierName}</TableCell>
                        <TableCell>{new Date(delivery.deliveredAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate">
                            {supplierService.formatMaterialList(delivery.materials)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate">
                            {delivery.notes || 'No notes'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No deliveries found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>

      {/* Add Supplier Form */}
      {showAddSupplierForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Add New Supplier</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddSupplierForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">Supplier Name *</Label>
                <Input
                  id="supplier-name"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  placeholder="Supplier company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-contact">Contact Person *</Label>
                <Input
                  id="supplier-contact"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                  placeholder="Primary contact person"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">Phone *</Label>
                <Input
                  id="supplier-phone"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input
                  id="supplier-email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-address">Address</Label>
                <Input
                  id="supplier-address"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  placeholder="Business address"
                />
              </div>
                             <div className="space-y-2">
                 <Label htmlFor="supplier-categories">Material Categories</Label>
                 <div className="space-y-2">
                   {materialCategories.map(category => (
                     <div key={category} className="flex items-center space-x-2">
                       <input
                         type="checkbox"
                         id={`category-${category}`}
                         checked={newSupplier.materialCategories.includes(category)}
                         onChange={(e) => {
                           if (e.target.checked) {
                             setNewSupplier({
                               ...newSupplier,
                               materialCategories: [...newSupplier.materialCategories, category]
                             });
                           } else {
                             setNewSupplier({
                               ...newSupplier,
                               materialCategories: newSupplier.materialCategories.filter(c => c !== category)
                             });
                           }
                         }}
                       />
                       <Label htmlFor={`category-${category}`} className="text-sm">
                         {category.replace('_', ' ')}
                       </Label>
                     </div>
                   ))}
                 </div>
               </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-preferences">Delivery Preferences</Label>
                <Textarea
                  id="supplier-preferences"
                  value={newSupplier.deliveryPreferences}
                  onChange={(e) => setNewSupplier({...newSupplier, deliveryPreferences: e.target.value})}
                  placeholder="Preferred delivery times, special instructions, etc."
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="supplier-primary"
                    checked={newSupplier.isPrimary}
                    onChange={(e) => setNewSupplier({...newSupplier, isPrimary: e.target.checked})}
                  />
                  <Label htmlFor="supplier-primary">Primary Supplier</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddSupplierForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSupplier}>
                <Save className="h-4 w-4 mr-2" />
                Save Supplier
              </Button>
            </div>
          </CardContent>
                 </Card>
       )}

       {/* Delivery Confirmation Modal */}
       <DeliveryConfirmationModal
         isOpen={showDeliveryModal}
         onClose={() => {
           setShowDeliveryModal(false);
           setSelectedTakeoffRequest(null);
         }}
         takeoffRequest={selectedTakeoffRequest}
         onDeliveryConfirmed={handleDeliveryConfirmed}
       />
     </div>
   );
 };

export default SupplierManagementPanel;
