import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Camera, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  Building,
  Phone,
  Mail,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  getMessages, 
  sendMessage, 
  getClientPhotos, 
  uploadClientPhoto,
  getPortalSettings,
  updatePortalSettings,
  createGeneralContractor,
  getGeneralContractors,
  updateGeneralContractor,
  deleteGeneralContractor,
  createSuperintendent,
  getSuperintendents,
  updateSuperintendent,
  deleteSuperintendent,
  createProjectManager,
  getProjectManagers,
  updateProjectManager,
  deleteProjectManager
} from '@/services/clientPortalService';
import { useJobs } from '@/hooks/useJobs';
import { format } from 'date-fns';

const ClientPortalPanel = () => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [portalSettings, setPortalSettings] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState('');

  // State for GC, Super, PM management
  const [generalContractors, setGeneralContractors] = useState([]);
  const [superintendents, setSuperintendents] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [showGCForm, setShowGCForm] = useState(false);
  const [showSuperForm, setShowSuperForm] = useState(false);
  const [showPMForm, setShowPMForm] = useState(false);
  const [selectedGC, setSelectedGC] = useState('');

  const { jobs } = useJobs();

  // New form states
  const [gcForm, setGCForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [superForm, setSuperForm] = useState({
    name: '',
    gcId: '',
    email: '',
    phone: ''
  });

  const [pmForm, setPMForm] = useState({
    name: '',
    gcId: '',
    email: '',
    phone: ''
  });

  // Load data
  useEffect(() => {
    loadPortalSettings();
    loadGCData();
  }, []);

  const loadPortalSettings = () => {
    const settings = getPortalSettings();
    setPortalSettings(settings);
  };

  const loadGCData = () => {
    const loadedGCs = getGeneralContractors();
    const loadedSupers = getSuperintendents();
    const loadedPMs = getProjectManagers();
    setGeneralContractors(loadedGCs);
    setSuperintendents(loadedSupers);
    setProjectManagers(loadedPMs);
  };

  // General Contractor handlers
  const handleCreateGC = () => {
    if (!gcForm.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the General Contractor name.",
        variant: "destructive"
      });
      return;
    }

    const newGC = createGeneralContractor(gcForm);
    setGeneralContractors(prev => [...prev, newGC]);
    setGCForm({ name: '', email: '', phone: '', address: '' });
    setShowGCForm(false);
    
    toast({
      title: "General Contractor Added! 🏗️",
      description: `New GC "${newGC.name}" has been added.`
    });
  };

  const handleUpdateGC = (gcId, updates) => {
    const updatedGC = updateGeneralContractor(gcId, updates);
    if (updatedGC) {
      setGeneralContractors(prev => prev.map(gc => gc.id === gcId ? updatedGC : gc));
      toast({
        title: "General Contractor Updated! ✅",
        description: `GC "${updatedGC.name}" has been updated.`
      });
    }
  };

  const handleDeleteGC = (gcId) => {
    const gc = generalContractors.find(g => g.id === gcId);
    deleteGeneralContractor(gcId);
    setGeneralContractors(prev => prev.filter(g => g.id !== gcId));
    // Also remove associated supers and PMs from state
    setSuperintendents(prev => prev.filter(s => s.gcId !== gcId));
    setProjectManagers(prev => prev.filter(pm => pm.gcId !== gcId));
    
    toast({
      title: "General Contractor Removed! 🗑️",
      description: `GC "${gc.name}" and all associated personnel have been removed.`
    });
  };

  // Superintendent handlers
  const handleCreateSuper = () => {
    if (!superForm.name.trim() || !superForm.gcId) {
      toast({
        title: "Missing Information",
        description: "Please enter the Superintendent name and select a General Contractor.",
        variant: "destructive"
      });
      return;
    }

    const newSuper = createSuperintendent(superForm);
    setSuperintendents(prev => [...prev, newSuper]);
    setSuperForm({ name: '', gcId: '', email: '', phone: '' });
    setShowSuperForm(false);
    
    toast({
      title: "Superintendent Added! 👷",
      description: `New Superintendent "${newSuper.name}" has been added.`
    });
  };

  const handleUpdateSuper = (superId, updates) => {
    const updatedSuper = updateSuperintendent(superId, updates);
    if (updatedSuper) {
      setSuperintendents(prev => prev.map(s => s.id === superId ? updatedSuper : s));
      toast({
        title: "Superintendent Updated! ✅",
        description: `Superintendent "${updatedSuper.name}" has been updated.`
      });
    }
  };

  const handleDeleteSuper = (superId) => {
    const super_ = superintendents.find(s => s.id === superId);
    deleteSuperintendent(superId);
    setSuperintendents(prev => prev.filter(s => s.id !== superId));
    
    toast({
      title: "Superintendent Removed! 🗑️",
      description: `Superintendent "${super_.name}" has been removed.`
    });
  };

  // Project Manager handlers
  const handleCreatePM = () => {
    if (!pmForm.name.trim() || !pmForm.gcId) {
      toast({
        title: "Missing Information",
        description: "Please enter the Project Manager name and select a General Contractor.",
        variant: "destructive"
      });
      return;
    }

    const newPM = createProjectManager(pmForm);
    setProjectManagers(prev => [...prev, newPM]);
    setPMForm({ name: '', gcId: '', email: '', phone: '' });
    setShowPMForm(false);
    
    toast({
      title: "Project Manager Added! 📋",
      description: `New Project Manager "${newPM.name}" has been added.`
    });
  };

  const handleUpdatePM = (pmId, updates) => {
    const updatedPM = updateProjectManager(pmId, updates);
    if (updatedPM) {
      setProjectManagers(prev => prev.map(pm => pm.id === pmId ? updatedPM : pm));
      toast({
        title: "Project Manager Updated! ✅",
        description: `Project Manager "${updatedPM.name}" has been updated.`
      });
    }
  };

  const handleDeletePM = (pmId) => {
    const pm = projectManagers.find(p => p.id === pmId);
    deleteProjectManager(pmId);
    setProjectManagers(prev => prev.filter(p => p.id !== pmId));
    
    toast({
      title: "Project Manager Removed! 🗑️",
      description: `Project Manager "${pm.name}" has been removed.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600">Manage client access and communication</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowSettingsModal(true)}
            variant="outline"
            className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary hover:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Portal Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="general-contractors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general-contractors" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>General Contractors</span>
          </TabsTrigger>
          <TabsTrigger value="superintendents" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Superintendents</span>
          </TabsTrigger>
          <TabsTrigger value="project-managers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Project Managers</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>Photos</span>
          </TabsTrigger>
        </TabsList>

        {/* General Contractors Tab */}
        <TabsContent value="general-contractors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">General Contractors</h2>
            <Button
              onClick={() => setShowGCForm(true)}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add General Contractor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalContractors.map((gc) => (
              <Card key={gc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{gc.name}</CardTitle>
                    </div>
                    <Badge variant="default">GC</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    {gc.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{gc.email}</span>
                      </div>
                    )}
                    {gc.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{gc.phone}</span>
                      </div>
                    )}
                    {gc.address && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-xs">{gc.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Associated Personnel */}
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600">
                      <div>Superintendents: {superintendents.filter(s => s.gcId === gc.id).length}</div>
                      <div>Project Managers: {projectManagers.filter(pm => pm.gcId === gc.id).length}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGCForm(gc);
                        setShowGCForm(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete General Contractor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {gc.name}? 
                            This will also remove all associated Superintendents and Project Managers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteGC(gc.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {generalContractors.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No General Contractors Yet</h3>
                <p className="text-gray-600 mb-4">Add your first General Contractor to start managing project teams.</p>
                <Button
                  onClick={() => setShowGCForm(true)}
                  className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add General Contractor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Superintendents Tab */}
        <TabsContent value="superintendents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Superintendents</h2>
            <Button
              onClick={() => setShowSuperForm(true)}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Superintendent
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {superintendents.map((super_) => {
              const gc = generalContractors.find(g => g.id === super_.gcId);
              return (
                <Card key={super_.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{super_.name}</CardTitle>
                        {gc && (
                          <p className="text-sm text-gray-600">{gc.name}</p>
                        )}
                      </div>
                      <Badge variant="secondary">Superintendent</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      {super_.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{super_.email}</span>
                        </div>
                      )}
                      {super_.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{super_.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSuperForm(super_);
                          setShowSuperForm(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Superintendent</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {super_.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSuper(super_.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {superintendents.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Superintendents Yet</h3>
                <p className="text-gray-600 mb-4">Add your first Superintendent to start managing project teams.</p>
                <Button
                  onClick={() => setShowSuperForm(true)}
                  className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Superintendent
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Project Managers Tab */}
        <TabsContent value="project-managers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Project Managers</h2>
            <Button
              onClick={() => setShowPMForm(true)}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project Manager
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectManagers.map((pm) => {
              const gc = generalContractors.find(g => g.id === pm.gcId);
              return (
                <Card key={pm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pm.name}</CardTitle>
                        {gc && (
                          <p className="text-sm text-gray-600">{gc.name}</p>
                        )}
                      </div>
                      <Badge variant="outline">Project Manager</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      {pm.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{pm.email}</span>
                        </div>
                      )}
                      {pm.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{pm.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPMForm(pm);
                          setShowPMForm(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project Manager</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {pm.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeletePM(pm.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {projectManagers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Managers Yet</h3>
                <p className="text-gray-600 mb-4">Add your first Project Manager to start managing project teams.</p>
                <Button
                  onClick={() => setShowPMForm(true)}
                  className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project Manager
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Messages functionality will be implemented when client portal access is set up.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                Photo sharing functionality will be implemented when client portal access is set up.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Portal Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Portal Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Photo Sharing</Label>
                <p className="text-sm text-gray-600">Allow clients to view progress photos</p>
              </div>
              <Button
                variant={portalSettings.allowPhotoSharing ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newSettings = { ...portalSettings, allowPhotoSharing: !portalSettings.allowPhotoSharing };
                  setPortalSettings(newSettings);
                  updatePortalSettings(newSettings);
                }}
              >
                {portalSettings.allowPhotoSharing ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Messaging</Label>
                <p className="text-sm text-gray-600">Allow clients to send messages</p>
              </div>
              <Button
                variant={portalSettings.allowMessaging ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newSettings = { ...portalSettings, allowMessaging: !portalSettings.allowMessaging };
                  setPortalSettings(newSettings);
                  updatePortalSettings(newSettings);
                }}
              >
                {portalSettings.allowMessaging ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Scope Review</Label>
                <p className="text-sm text-gray-600">Allow clients to review scope of work</p>
              </div>
              <Button
                variant={portalSettings.allowScopeReview ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newSettings = { ...portalSettings, allowScopeReview: !portalSettings.allowScopeReview };
                  setPortalSettings(newSettings);
                  updatePortalSettings(newSettings);
                }}
              >
                {portalSettings.allowScopeReview ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Financial View</Label>
                <p className="text-sm text-gray-600">Allow clients to view invoice status</p>
              </div>
              <Button
                variant={portalSettings.allowFinancialView ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newSettings = { ...portalSettings, allowFinancialView: !portalSettings.allowFinancialView };
                  setPortalSettings(newSettings);
                  updatePortalSettings(newSettings);
                }}
              >
                {portalSettings.allowFinancialView ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettingsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* General Contractor Form Modal */}
      <Dialog open={showGCForm} onOpenChange={setShowGCForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{gcForm.id ? 'Edit' : 'Add'} General Contractor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="gcName">Name *</Label>
              <Input
                id="gcName"
                value={gcForm.name}
                onChange={(e) => setGCForm({ ...gcForm, name: e.target.value })}
                placeholder="Enter GC name"
              />
            </div>

            <div>
              <Label htmlFor="gcEmail">Email</Label>
              <Input
                id="gcEmail"
                type="email"
                value={gcForm.email}
                onChange={(e) => setGCForm({ ...gcForm, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="gcPhone">Phone</Label>
              <Input
                id="gcPhone"
                value={gcForm.phone}
                onChange={(e) => setGCForm({ ...gcForm, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
            <div>
              <Label htmlFor="gcAddress">Address</Label>
              <Textarea
                id="gcAddress"
                value={gcForm.address}
                onChange={(e) => setGCForm({ ...gcForm, address: e.target.value })}
                placeholder="Enter address"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowGCForm(false);
              setGCForm({ name: '', email: '', phone: '', address: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={gcForm.id ? () => {
              handleUpdateGC(gcForm.id, gcForm);
              setShowGCForm(false);
              setGCForm({ name: '', email: '', phone: '', address: '' });
            } : handleCreateGC}>
              {gcForm.id ? 'Update' : 'Create'} General Contractor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Superintendent Form Modal */}
      <Dialog open={showSuperForm} onOpenChange={setShowSuperForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{superForm.id ? 'Edit' : 'Add'} Superintendent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="superName">Name *</Label>
              <Input
                id="superName"
                value={superForm.name}
                onChange={(e) => setSuperForm({ ...superForm, name: e.target.value })}
                placeholder="Enter superintendent name"
              />
            </div>
            <div>
              <Label htmlFor="superGC">General Contractor *</Label>
              <Select value={superForm.gcId} onValueChange={(value) => setSuperForm({ ...superForm, gcId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select General Contractor" />
                </SelectTrigger>
                <SelectContent>
                  {generalContractors.map(gc => (
                    <SelectItem key={gc.id} value={gc.id}>
                      {gc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="superEmail">Email</Label>
              <Input
                id="superEmail"
                type="email"
                value={superForm.email}
                onChange={(e) => setSuperForm({ ...superForm, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="superPhone">Phone</Label>
              <Input
                id="superPhone"
                value={superForm.phone}
                onChange={(e) => setSuperForm({ ...superForm, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSuperForm(false);
              setSuperForm({ name: '', gcId: '', email: '', phone: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={superForm.id ? () => {
              handleUpdateSuper(superForm.id, superForm);
              setShowSuperForm(false);
              setSuperForm({ name: '', gcId: '', email: '', phone: '' });
            } : handleCreateSuper}>
              {superForm.id ? 'Update' : 'Create'} Superintendent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Manager Form Modal */}
      <Dialog open={showPMForm} onOpenChange={setShowPMForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{pmForm.id ? 'Edit' : 'Add'} Project Manager</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pmName">Name *</Label>
              <Input
                id="pmName"
                value={pmForm.name}
                onChange={(e) => setPMForm({ ...pmForm, name: e.target.value })}
                placeholder="Enter project manager name"
              />
            </div>
            <div>
              <Label htmlFor="pmGC">General Contractor *</Label>
              <Select value={pmForm.gcId} onValueChange={(value) => setPMForm({ ...pmForm, gcId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select General Contractor" />
                </SelectTrigger>
                <SelectContent>
                  {generalContractors.map(gc => (
                    <SelectItem key={gc.id} value={gc.id}>
                      {gc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pmEmail">Email</Label>
              <Input
                id="pmEmail"
                type="email"
                value={pmForm.email}
                onChange={(e) => setPMForm({ ...pmForm, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="pmPhone">Phone</Label>
              <Input
                id="pmPhone"
                value={pmForm.phone}
                onChange={(e) => setPMForm({ ...pmForm, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPMForm(false);
              setPMForm({ name: '', gcId: '', email: '', phone: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={pmForm.id ? () => {
              handleUpdatePM(pmForm.id, pmForm);
              setShowPMForm(false);
              setPMForm({ name: '', gcId: '', email: '', phone: '' });
            } : handleCreatePM}>
              {pmForm.id ? 'Update' : 'Create'} Project Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPortalPanel;
