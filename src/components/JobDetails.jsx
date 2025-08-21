import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, MapPin, Key, Plus, Hammer, Ruler, ClipboardList, Layers, Edit3, Trash2, PlusCircle, FileText, Package, Calculator, Play, Archive, DollarSign, Save, X, Home, Building, FolderOpen, Users, Send } from 'lucide-react';
import quickbooksIntegrationService from '@/services/quickbooksIntegrationService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EditTakeoffEntryModal from '@/components/EditTakeoffEntryModal';
import PhaseMaterialsModal from '@/components/PhaseMaterialsModal';
import ChecklistManager from '@/components/ChecklistManager';
import CreateChecklistForm from '@/components/CreateChecklistForm';
import ChecklistTemplates from '@/components/ChecklistTemplates';
import JobDocuments from '@/components/JobDocuments';
import DailyLog from '@/components/DailyLog';
import MessagesSection from '@/components/MessagesSection';
import { getGeneralContractors, getSuperintendents, getProjectManagers } from '@/services/clientPortalService';


const JobDetails = ({ 
  job, 
  onUpdateJob, 
  onSelectScope, 
  onAddDefaultScopes, 
  onCreateTakeoffPhase, 
  onAddTakeoffEntry, 
  onDeleteScope, 
  onOpenCreateScopeModal, 
  onUpdateTakeoffEntry, 
  onDeleteTakeoffEntry, 
  onDeleteTakeoffPhase, 
  onUpdatePhaseMaterials, 
  onShowTakeoffReport, 
  onShowFinancials, 
  onDeleteJob,
  // Checklist props
  onCreateChecklist,
  onUpdateChecklist,
  onDeleteChecklist,
  onCompleteChecklist,
  onSaveChecklistTemplate,
  onGetChecklistTemplates,
  onDeleteChecklistTemplate,
  employees,
  onGoToScheduleForJob,
  // Document props
  onUploadDocument,
  onDeleteDocument,
  onUpdateDocument,
  // Daily log props
  onGetLogsForJob,
  onAddLogEntry,
  onUpdateLogEntry,
  onDeleteLogEntry,
  onAddAttachmentToLog,
  onRemoveAttachmentFromLog
}) => {
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingPhaseMaterials, setEditingPhaseMaterials] = useState(null);
  const [isEditingJobInfo, setIsEditingJobInfo] = useState(false);
  const [checklistView, setChecklistView] = useState('checklists'); // 'checklists', 'create', 'templates'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'takeoff', 'checklists', 'documents'
  const [initializingQuickBooks, setInitializingQuickBooks] = useState(false);
  const [editFormData, setEditFormData] = useState({
    jobName: '',
    jobType: '',
    generalContractor: '',
    superintendent: '',
    projectManager: '',
    address: '',
    lockboxCode: ''
  });
  
  // Client portal data for dropdowns
  const [generalContractors, setGeneralContractors] = useState([]);
  const [superintendents, setSuperintendents] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);

  if (!job) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">No job selected or job data is unavailable.</p>
        <p className="text-gray-500 text-sm mt-1">Please go back to the jobs list and select a job.</p>
      </div>
    );
  }

  // Load client portal data for dropdowns
  useEffect(() => {
    const existingGCs = getGeneralContractors();
    const existingSupers = getSuperintendents();
    const existingPMs = getProjectManagers();
    setGeneralContractors(existingGCs);
    setSuperintendents(existingSupers);
    setProjectManagers(existingPMs);
  }, []);

  // Initialize edit form data when job changes
  React.useEffect(() => {
    if (job) {
      setEditFormData({
        jobName: job.jobName || '',
        jobType: job.jobType || 'residential',
        generalContractor: job.generalContractor || '',
        superintendent: job.superintendent || '',
        projectManager: job.projectManager || '',
        address: job.address || '',
        lockboxCode: job.lockboxCode || ''
      });
    }
  }, [job]);

  const scopes = job?.scopes || [];
  const takeoffPhases = job?.takeoffPhases || [];
  const jobStatus = job.status || 'estimating';
  const jobType = job.jobType || 'residential';
  
  // Helper functions to filter based on selected GC
  const getFilteredSuperintendents = () => {
    if (!editFormData.generalContractor) return superintendents;
    const selectedGC = generalContractors.find(gc => gc.name === editFormData.generalContractor);
    if (!selectedGC) return superintendents;
    return superintendents.filter(s => s.gcId === selectedGC.id);
  };

  const getFilteredProjectManagers = () => {
    if (!editFormData.generalContractor) return projectManagers;
    const selectedGC = generalContractors.find(gc => gc.name === editFormData.generalContractor);
    if (!selectedGC) return projectManagers;
    return projectManagers.filter(pm => pm.gcId === selectedGC.id);
  };
  
  const hasDefaultScopes = () => {
    const defaultScopeNames = ['Hang', 'Finish'];
    const existingScopeNames = scopes.map(s => s.name);
    return defaultScopeNames.every(name => existingScopeNames.includes(name));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJobStatusDisplay = (status) => {
    switch (status) {
      case 'estimating':
        return { text: 'Estimating Phase', color: 'bg-blue-100 text-blue-800', icon: Calculator };
      case 'active':
        return { text: 'Active Job', color: 'bg-green-100 text-green-800', icon: Play };
      case 'inactive':
        return { text: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Archive };
      default:
        return { text: 'Estimating Phase', color: 'bg-blue-100 text-blue-800', icon: Calculator };
    }
  };

  const statusDisplay = getJobStatusDisplay(jobStatus);
  const StatusIcon = statusDisplay.icon;
  
  const handleEditFloorSpace = (phaseId, floorSpaceEntry) => {
    setEditingEntry({ phaseId, floorSpaceEntry });
  };

  const handleSaveEditedEntry = (updatedEntry) => {
    if (onUpdateTakeoffEntry) {
      onUpdateTakeoffEntry(editingEntry.phaseId, updatedEntry);
    }
    setEditingEntry(null);
  };

  const handleDeleteFloorSpace = (phaseId, floorSpaceId) => {
    if (onDeleteTakeoffEntry) {
      onDeleteTakeoffEntry(phaseId, floorSpaceId);
    }
  };

  const handleEditPhaseMaterials = (phase) => {
    setEditingPhaseMaterials(phase);
  };

  const handleSavePhaseMaterials = (phaseId, materials) => {
    if (onUpdatePhaseMaterials) {
      onUpdatePhaseMaterials(phaseId, materials);
    }
    setEditingPhaseMaterials(null);
  };

  const handleDeleteTakeoffPhase = (jobId, phaseId) => {
    if (onDeleteTakeoffPhase) {
      onDeleteTakeoffPhase(jobId, phaseId);
    }
  };

  const handleSaveJobInfo = () => {
    if (!editFormData.jobName.trim()) {
      toast({
        title: "Missing Information",
        description: "Job name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!editFormData.jobType) {
      toast({
        title: "Missing Information",
        description: "Job type is required.",
        variant: "destructive"
      });
      return;
    }

    if (!editFormData.generalContractor.trim()) {
      toast({
        title: "Missing Information",
        description: "General Contractor name is required.",
        variant: "destructive"
      });
      return;
    }

    onUpdateJob(job.id, editFormData);
    setIsEditingJobInfo(false);
    toast({
      title: "Job Updated! ✅",
      description: "Job information has been updated successfully."
    });
  };

  const handleCancelJobEdit = () => {
    setEditFormData({
      jobName: job.jobName || '',
      jobType: job.jobType || 'residential',
      generalContractor: job.generalContractor || '',
      superintendent: job.superintendent || '',
      address: job.address || '',
      lockboxCode: job.lockboxCode || ''
    });
    setIsEditingJobInfo(false);
  };

  // QuickBooks Integration Functions
  const getQuickBooksSyncStatus = () => {
    return quickbooksIntegrationService.getJobSyncStatus(job);
  };

  const initializeJobInQuickBooks = async () => {
    setInitializingQuickBooks(true);
    
    try {
      const result = await quickbooksIntegrationService.initializeJobInQuickBooks(job);
      
      if (result.success) {
        // Update job with QuickBooks data
        onUpdateJob(job.id, result.job);
        
        toast({
          title: "QuickBooks Project Created! ✅",
          description: `Project "${job.jobName}" has been created in QuickBooks with estimate.`,
        });
      } else {
        toast({
          title: "QuickBooks Setup Queued",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        title: "QuickBooks Setup Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setInitializingQuickBooks(false);
    }
  };

  const getEntryDisplayName = (entry) => {
    if (jobType === 'commercial') {
      return entry.unitType || 'Unknown Unit Type';
    } else {
      return entry.floorSpace || 'Unknown Floor/Space';
    }
  };

  // Show different action buttons based on job status
  const renderJobActions = () => {
    if (jobStatus === 'estimating') {
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'active' })}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Start Job
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the job and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, delete job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    } else if (jobStatus === 'active') {
      // Active jobs can be set to inactive or back to estimating
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'inactive' })}
            variant="outline"
            size="sm"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 text-xs"
          >
            <Archive className="h-3 w-3 mr-1" />
            Set Inactive
          </Button>
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'estimating' })}
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            Back to Estimating
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the job and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, delete job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    } else {
      // Inactive jobs can be reactivated or moved back to estimating
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'active' })}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Reactivate
          </Button>
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'estimating' })}
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            Back to Estimating
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the job and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, delete job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Add the button at the top */}
      {onGoToScheduleForJob && job && (
        <div className="flex justify-end">
          <Button
            onClick={() => onGoToScheduleForJob(job.id)}
            className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white mb-2"
          >
            View Schedule for This Job
          </Button>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  {isEditingJobInfo ? (
                    <div className="space-y-2">
                      <Input
                        value={editFormData.jobName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, jobName: e.target.value }))}
                        placeholder="Enter job name"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      />
                    </div>
                  ) : (
                    <CardTitle className="text-3xl font-bold">{job?.jobName}</CardTitle>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <p className="text-white/80">Construction Job Details</p>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} text-gray-800`}>
                      <StatusIcon className="h-4 w-4" />
                      <span>{statusDisplay.text}</span>
                    </span>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      jobType === 'residential' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {jobType === 'residential' ? <Home className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                      <span className="capitalize">{jobType}</span>
                    </span>
                    {/* QuickBooks Status Badge */}
                    {quickbooksIntegrationService.isJobSynced(job) && (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Send className="h-4 w-4" />
                        <span>QuickBooks</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {/* Primary Actions Row */}
                <div className="flex items-center space-x-2">
                  {!isEditingJobInfo ? (
                    <>
                      <Button
                        onClick={() => setIsEditingJobInfo(true)}
                        variant="outline"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Job Info
                      </Button>
                      {/* Always show Financials and Takeoff Report buttons */}
                      <Button
                        onClick={onShowFinancials}
                        variant="outline"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Financials
                      </Button>
                      {/* Only show Takeoff Report if there are takeoff phases */}
                      {takeoffPhases.length > 0 && (
                        <Button
                          onClick={onShowTakeoffReport}
                          variant="outline"
                          className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Takeoff Report
                        </Button>
                      )}
                      {/* QuickBooks Setup Button - only show for active jobs that aren't synced */}
                      {jobStatus === 'active' && !quickbooksIntegrationService.isJobSynced(job) && (
                        <Button
                          onClick={initializeJobInQuickBooks}
                          disabled={initializingQuickBooks}
                          variant="outline"
                          className="bg-white/10 text-white hover:bg-white/20 border-white/30 border-orange-500"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {initializingQuickBooks ? 'Setting up...' : 'Setup QuickBooks'}
                        </Button>
                      )}
                      {/* QuickBooks Status - show for synced jobs */}
                      {quickbooksIntegrationService.isJobSynced(job) && (
                        <Button
                          variant="outline"
                          className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-400"
                          disabled
                        >
                          <Send className="h-4 w-4 mr-2" />
                          QuickBooks Connected
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelJobEdit}
                        variant="outline"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveJobInfo}
                        className="bg-white text-brandPrimary hover:bg-white/90"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Secondary Actions Row - Smaller buttons */}
                <div className="flex items-center space-x-2">
                  {renderJobActions()}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="flex items-center space-x-3">
              {jobType === 'residential' ? <Home className="h-5 w-5 text-white/70" /> : <Building className="h-5 w-5 text-white/70" />}
              <div>
                <p className="text-white/70 text-sm">Job Type</p>
                {isEditingJobInfo ? (
                  <Select
                    value={editFormData.jobType}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, jobType: value }))}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4" />
                          <span>Residential</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Commercial</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-semibold capitalize">{jobType}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">General Contractor</p>
                {isEditingJobInfo ? (
                  <Select
                    value={editFormData.generalContractor}
                    onValueChange={(value) => {
                      setEditFormData(prev => ({ 
                        ...prev, 
                        generalContractor: value,
                        superintendent: '', // Reset when GC changes
                        projectManager: '' // Reset when GC changes
                      }));
                    }}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white mt-1">
                      <SelectValue placeholder="Select General Contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {generalContractors.map((gc) => (
                        <SelectItem key={gc.id} value={gc.name}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>{gc.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-semibold">{job?.generalContractor}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Superintendent</p>
                {isEditingJobInfo ? (
                  <Select
                    value={editFormData.superintendent || 'none'}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, superintendent: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white mt-1">
                      <SelectValue placeholder="Select Superintendent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center space-x-2">
                          <span>No Superintendent</span>
                        </div>
                      </SelectItem>
                      {getFilteredSuperintendents().map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{s.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-semibold">{job?.superintendent || 'Not specified'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Project Manager</p>
                {isEditingJobInfo ? (
                  <Select
                    value={editFormData.projectManager || 'none'}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, projectManager: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white mt-1">
                      <SelectValue placeholder="Select Project Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center space-x-2">
                          <span>No Project Manager</span>
                        </div>
                      </SelectItem>
                      {getFilteredProjectManagers().map((pm) => (
                        <SelectItem key={pm.id} value={pm.name}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{pm.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-semibold">{job?.projectManager || 'Not specified'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Address</p>
                {isEditingJobInfo ? (
                  <Input
                    value={editFormData.address}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter job site address"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 mt-1"
                  />
                ) : (
                  <p className="font-semibold">{job?.address || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Hammer className="h-6 w-6 text-brandPrimary" />
                <CardTitle className="text-2xl font-bold text-gray-900">Scopes of Work</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {!hasDefaultScopes() && (
                  <Button
                    onClick={onAddDefaultScopes}
                    className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Defaults
                  </Button>
                )}
                <Button
                  onClick={onOpenCreateScopeModal}
                  variant="outline"
                  className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Scope
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scopes.length === 0 ? (
              <div className="text-center py-12 construction-pattern rounded-xl">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No scopes of work added yet</p>
                <p className="text-gray-500 text-sm mt-1">Add default scopes or create a new one to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scopes.map((scope, index) => (
                  <motion.div
                    key={scope.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-brandPrimary relative group">
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 h-7 w-7">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Scope "{scope.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. Are you sure you want to delete this scope?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteScope(scope.id)} className="bg-red-600 hover:bg-red-700">
                                        Yes, delete scope
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       </div>
                      <CardContent className="p-4 cursor-pointer" onClick={() => onSelectScope(scope)}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{scope.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(scope.status)}`}>
                            {scope.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{scope.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Only show takeoffs section for active jobs or jobs with existing takeoffs */}
      {(jobStatus === 'active' || takeoffPhases.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Ruler className="h-6 w-6 text-brandSecondary" />
                  <CardTitle className="text-2xl font-bold text-gray-900">Field Takeoffs</CardTitle>
                  {jobType === 'commercial' && (
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Commercial Mode
                    </span>
                  )}
                </div>
                {jobStatus === 'active' && (
                  <Button
                    onClick={onCreateTakeoffPhase}
                    className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    New Takeoff Phase
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {takeoffPhases.length === 0 ? (
                <div className="text-center py-12 construction-pattern rounded-xl">
                  <Ruler className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">No takeoff phases created yet.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {jobStatus === 'active' ? 'Create a phase to start adding takeoff entries.' : 'Takeoffs are available once the job is active.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {takeoffPhases.map((phase) => (
                      <div key={phase.id} className="border rounded-lg p-4 bg-slate-50 shadow-md">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-xl text-gray-900 flex items-center">
                            <Layers className="h-5 w-5 mr-2 text-brandSecondary" />
                            {phase.name}
                          </h3>
                          {jobStatus === 'active' && (
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleEditPhaseMaterials(phase)}
                                size="sm"
                                variant="outline"
                                className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Phase Accessories
                              </Button>
                              <Button
                                onClick={() => onAddTakeoffEntry(phase.id)}
                                size="sm"
                                className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Entries to Phase
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete Phase
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Takeoff Phase?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the "{phase.name}" phase and all its entries. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteTakeoffPhase(job.id, phase.id)} 
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Yes, delete phase
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>

                        {/* Phase Materials Summary */}
                        {phase.materials && phase.materials.length > 0 && (
                          <div className="mb-4 p-3 bg-brandPrimary/10 rounded-lg border border-brandPrimary/20">
                            <h4 className="font-semibold text-sm text-brandPrimary mb-2 flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              Phase Materials ({phase.materials.length} items)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {phase.materials.slice(0, 8).map((material, idx) => (
                                <div key={idx} className="text-brandPrimary">
                                  {material.subtype || material.type}: {material.quantity} {material.unit}
                                </div>
                              ))}
                              {phase.materials.length > 8 && (
                                <div className="text-brandPrimary italic">
                                  +{phase.materials.length - 8} more...
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {(phase.entries || []).length > 0 ? (
                           (phase.entries || []).map(entry => (
                            <div key={entry.id} className="border rounded-md p-4 bg-white mb-4 shadow">
                              <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-semibold text-lg text-gray-800 flex items-center">
                                  <Building2 className="h-5 w-5 mr-2 text-brandSecondary" />
                                  {getEntryDisplayName(entry)}
                                  {jobType === 'commercial' && entry.unitNumbers && (
                                    <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      Units: {entry.unitNumbers}
                                    </span>
                                  )}
                                  </h4>
                                  {jobStatus === 'active' && (
                                    <div className="space-x-2">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-brandSecondary hover:bg-brandSecondary/10" 
                                          onClick={() => handleEditFloorSpace(phase.id, entry)}
                                        >
                                            <Edit3 className="h-4 w-4"/>
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-100">
                                              <Trash2 className="h-4 w-4"/>
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will permanently delete "{getEntryDisplayName(entry)}" and all its board entries. This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => handleDeleteFloorSpace(phase.id, entry.id)} 
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Yes, delete entry
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                  )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {(entry.boards || []).map((board, index) => (
                                  <motion.div
                                    key={board.id || index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <Card className="border-l-4 border-l-brandSecondary hover:shadow-md transition-shadow">
                                      <CardContent className="p-3">
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-start">
                                            <span className="font-semibold text-sm text-gray-900">
                                              {board.boardType}
                                            </span>
                                            <span className="bg-brandSecondary/10 text-brandSecondary px-2 py-0.5 rounded text-xs font-medium">
                                              {board.quantity} pcs
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            <p>{board.thickness}" × {board.width}" × {board.length}'</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                              {entry.notes && (
                                  <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 p-2 rounded-md">
                                      <strong>Notes:</strong> {entry.notes}
                                  </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            {jobStatus === 'active' ? 'No entries in this phase yet. Click "Add Entries to Phase" to start.' : 'No entries in this phase.'}
                          </p>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Checklists Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">Checklists</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setChecklistView('checklists')}
                  variant={checklistView === 'checklists' ? 'default' : 'outline'}
                  size="sm"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Checklists
                </Button>
                <Button
                  onClick={() => setChecklistView('templates')}
                  variant={checklistView === 'templates' ? 'default' : 'outline'}
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button
                  onClick={() => setChecklistView('create')}
                  className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Checklist
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {checklistView === 'checklists' && (
              <ChecklistManager
                jobId={job.id}
                checklists={job.checklists || []}
                employees={employees || []}
                onCreateChecklist={() => setChecklistView('create')}
                onUpdateChecklist={(jobId, checklistId, updatedChecklist) => 
                  onUpdateChecklist(jobId, checklistId, updatedChecklist)
                }
                onDeleteChecklist={(jobId, checklistId) => 
                  onDeleteChecklist(jobId, checklistId)
                }
                onCompleteChecklist={(jobId, checklistId) => 
                  onCompleteChecklist(jobId, checklistId)
                }
                onSaveChecklistTemplate={(templateData) => {
                  onSaveChecklistTemplate(templateData);
                }}
                noCard={true}
              />
            )}
            
            {checklistView === 'create' && (
              <CreateChecklistForm
                jobId={job.id}
                employees={employees || []}
                onSubmit={(jobId, checklistData) => {
                  onCreateChecklist(jobId, checklistData, () => setChecklistView('checklists'));
                }}
                onCancel={() => setChecklistView('checklists')}
                onSaveAsTemplate={(templateData) => {
                  onSaveChecklistTemplate(templateData, () => setChecklistView('checklists'));
                }}
              />
            )}
            
            {checklistView === 'templates' && (
              <ChecklistTemplates
                templates={onGetChecklistTemplates()}
                employees={employees || []}
                onUseTemplate={(template) => {
                  onCreateChecklist(job.id, template, () => setChecklistView('checklists'));
                }}
                onDeleteTemplate={(templateId) => {
                  onDeleteChecklistTemplate(templateId);
                }}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <JobDocuments
              jobId={job.id}
              documents={job.documents || []}
              onUploadDocument={(jobId, document) => {
                onUploadDocument(jobId, document);
              }}
              onDeleteDocument={(jobId, documentId) => {
                onDeleteDocument(jobId, documentId);
              }}
              onUpdateDocument={(jobId, documentId, updates) => {
                onUpdateDocument(jobId, documentId, updates);
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Log Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Daily Log</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyLog
              jobId={job.id}
              logs={onGetLogsForJob(job.id)}
              employees={employees || []}
              onAddLog={(jobId, logData) => onAddLogEntry(jobId, logData)}
              onUpdateLog={(jobId, logId, updates) => onUpdateLogEntry(jobId, logId, updates)}
              onDeleteLog={(jobId, logId) => onDeleteLogEntry(jobId, logId)}
              onAddAttachment={(jobId, logId, attachment) => onAddAttachmentToLog(jobId, logId, attachment)}
              onRemoveAttachment={(jobId, logId, attachmentId) => onRemoveAttachmentFromLog(jobId, logId, attachmentId)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Messages Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <MessagesSection
          job={job}
          employees={employees || []}
          subcontractors={[]} // TODO: Add subcontractors data
          vendors={[]} // TODO: Add vendors data
        />
      </motion.div>

      {/* Edit Takeoff Entry Modal */}
      <EditTakeoffEntryModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        floorSpaceEntry={editingEntry?.floorSpaceEntry}
        onSave={handleSaveEditedEntry}
        onDelete={(entryId) => {
          handleDeleteFloorSpace(editingEntry.phaseId, entryId);
          setEditingEntry(null);
        }}
        jobType={jobType}
      />

              {/* Phase Materials Modal */}
        <PhaseMaterialsModal
          isOpen={!!editingPhaseMaterials}
          onClose={() => setEditingPhaseMaterials(null)}
          phase={editingPhaseMaterials}
          onSave={handleSavePhaseMaterials}
        />
    </div>
  );
};

export default JobDetails;