import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Home, Building, User, Users, MapPin, Key, Edit3, X, DollarSign, FileText, Play, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getGeneralContractors, getSuperintendents, getProjectManagers } from '@/services/clientPortalService';
import JobHeader from './JobHeader';
import ScopesSection from './ScopesSection';
import TakeoffSection from './TakeoffSection';
import ChecklistsSection from './ChecklistsSection';
import DocumentsSection from './DocumentsSection';
import DailyLogSection from './DailyLogSection';
import MessagesSection from './MessagesSection';
import EditTakeoffEntryModal from '@/components/EditTakeoffEntryModal';
import PhaseMaterialsModal from '@/components/PhaseMaterialsModal';

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
  useEffect(() => {
    setEditFormData({
      jobName: job.jobName || '',
      jobType: job.jobType || 'residential',
      generalContractor: job.generalContractor || '',
      superintendent: job.superintendent || '',
      projectManager: job.projectManager || '',
      address: job.address || '',
      lockboxCode: job.lockboxCode || ''
    });
  }, [job]);

  const jobType = job.jobType || 'residential';
  const jobStatus = job.status || 'estimating';
  const takeoffPhases = job.takeoffs || [];

  // Status display configuration
  const statusDisplay = {
    estimating: { text: 'Estimating', color: 'bg-yellow-100 text-yellow-800', icon: '📋' },
    active: { text: 'Active', color: 'bg-green-100 text-green-800', icon: '🚧' },
    completed: { text: 'Completed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    on_hold: { text: 'On Hold', color: 'bg-red-100 text-red-800', icon: '⏸️' }
  };

  const StatusIcon = () => <span>{statusDisplay[jobStatus]?.icon || '📋'}</span>;

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

  const hasDefaultScopes = () => {
    return job.scopes && job.scopes.length > 0;
  };

  const handleSaveEditedEntry = (updatedEntry) => {
    onUpdateTakeoffEntry(job.id, editingEntry.phaseId, updatedEntry);
    setEditingEntry(null);
  };

  const handleDeleteFloorSpace = (phaseId, entryId) => {
    onDeleteTakeoffEntry(phaseId, entryId);
  };

  const handleSavePhaseMaterials = (materials) => {
    onUpdatePhaseMaterials(editingPhaseMaterials.id, materials);
    setEditingPhaseMaterials(null);
  };

  return (
    <div className="space-y-8">
      {/* Schedule Button */}
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

      {/* Job Header */}
      <JobHeader
        job={job}
        isEditingJobInfo={isEditingJobInfo}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        setIsEditingJobInfo={setIsEditingJobInfo}
        handleSaveJobInfo={handleSaveJobInfo}
        handleCancelJobEdit={handleCancelJobEdit}
        onShowFinancials={onShowFinancials}
        onShowTakeoffReport={onShowTakeoffReport}
        onDeleteJob={onDeleteJob}
        onUpdateJob={onUpdateJob}
        takeoffPhases={takeoffPhases}
        generalContractors={generalContractors}
        superintendents={superintendents}
        projectManagers={projectManagers}
        statusDisplay={statusDisplay}
        StatusIcon={StatusIcon}
      />

      {/* Scopes Section */}
      <ScopesSection
        job={job}
        onSelectScope={onSelectScope}
        onAddDefaultScopes={onAddDefaultScopes}
        onOpenCreateScopeModal={onOpenCreateScopeModal}
        onDeleteScope={onDeleteScope}
        hasDefaultScopes={hasDefaultScopes}
      />

      {/* Takeoff Section */}
      <TakeoffSection
        job={job}
        takeoffPhases={takeoffPhases}
        onCreateTakeoffPhase={onCreateTakeoffPhase}
        onAddTakeoffEntry={onAddTakeoffEntry}
        onDeleteTakeoffPhase={onDeleteTakeoffPhase}
        onUpdateTakeoffEntry={onUpdateTakeoffEntry}
        onDeleteTakeoffEntry={onDeleteTakeoffEntry}
        setEditingEntry={setEditingEntry}
        setEditingPhaseMaterials={setEditingPhaseMaterials}
        jobType={jobType}
      />

      {/* Checklists Section */}
      <ChecklistsSection
        job={job}
        employees={employees}
        onCreateChecklist={onCreateChecklist}
        onUpdateChecklist={onUpdateChecklist}
        onDeleteChecklist={onDeleteChecklist}
        onCompleteChecklist={onCompleteChecklist}
        onSaveChecklistTemplate={onSaveChecklistTemplate}
        onGetChecklistTemplates={onGetChecklistTemplates}
        onDeleteChecklistTemplate={onDeleteChecklistTemplate}
      />

      {/* Documents Section */}
      <DocumentsSection
        job={job}
        onUploadDocument={onUploadDocument}
        onDeleteDocument={onDeleteDocument}
        onUpdateDocument={onUpdateDocument}
      />

      {/* Daily Log Section */}
      <DailyLogSection
        job={job}
        employees={employees}
        onGetLogsForJob={onGetLogsForJob}
        onAddLogEntry={onAddLogEntry}
        onUpdateLogEntry={onUpdateLogEntry}
        onDeleteLogEntry={onDeleteLogEntry}
        onAddAttachmentToLog={onAddAttachmentToLog}
        onRemoveAttachmentFromLog={onRemoveAttachmentFromLog}
      />

      {/* Messages Section */}
      <MessagesSection
        job={job}
        employees={employees}
        subcontractors={[]} // TODO: Add subcontractors data
        vendors={[]} // TODO: Add vendors data
      />

      {/* Modals */}
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
