import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, ArrowLeft, Clock, DollarSign, LogOut, Calendar, Database, BarChart3, FileText, DollarSign as DollarSignIcon, Warehouse, TrendingUp, MapPin, Truck, Globe, Users, Settings, Users as UsersIcon, Calculator, X, Building2 as Building2Icon, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initializeSampleData } from '@/data/sampleData';

import NavigationDropdown from '@/components/ui/navigation-dropdown';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import JobsList from '@/components/JobsList';
import JobDetails from '@/components/JobDetails';
import JobFinancials from '@/components/job-financials/JobFinancials';
import ScopeDetails from '@/components/ScopeDetails';
import CreateJobForm from '@/components/CreateJobForm';
import CreateScopeForm from '@/components/CreateScopeForm';
import CreateTakeoffForm from '@/components/CreateTakeoffForm';
import CreateTakeoffPhaseForm from '@/components/CreateTakeoffPhaseForm'; 
import TakeoffReportModal from '@/components/TakeoffReportModal';
import TimeClock from '@/components/TimeClock';
import PayrollDashboard from '@/components/PayrollDashboard';
import LaborManagement from '@/components/LaborManagement';
import ScheduleDashboardWithProvider from '@/components/ScheduleDashboard';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import InvoiceProcessingPanel from '@/components/InvoiceProcessingPanel';
import MaterialPricingPanel from '@/components/MaterialPricingPanel';
import InventoryManagementPanel from '@/components/inventory-management/InventoryManagementPanel';
import CashFlowPanel from '@/components/CashFlowPanel';
import SupplierManagementPanel from '@/components/SupplierManagementPanel';
import ClientPortalPanel from '@/components/ClientPortalPanel';
import QuickBooksConnection from '@/components/quickbooks/QuickBooksConnection';
import CommercialProjectManager from '@/components/CommercialProjectManager';

import AuthWrapper from '@/components/AuthWrapper';
import DataManager from '@/components/DataManager';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useJobs } from '@/hooks/useJobs';

function AppContent({ onLogout }) {
  const [currentMainView, setCurrentMainView] = useState('jobs'); // Main navigation: jobs, time-clock, payroll, schedule
  const [currentJobView, setCurrentJobView] = useState('jobs'); // Job sub-navigation
  const [showDataManager, setShowDataManager] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Initialize sample data on app load
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Replace selectedJob with selectedJobId
  const [selectedJobId, setSelectedJobId] = useState(null);
  // Remove selectedJob state
  // const [selectedJob, setSelectedJob] = useState(null);

  const [selectedScope, setSelectedScope] = useState(null);
  const [selectedTakeoffPhaseId, setSelectedTakeoffPhaseId] = useState(null);
  const [showTakeoffReportModal, setShowTakeoffReportModal] = useState(false);
  const [isCreateScopeModalOpen, setIsCreateScopeModalOpen] = useState(false);

  const [scheduleInitialJobId, setScheduleInitialJobId] = useState(null);

  const {
    jobs,
    loading,
    jobsUpdateTimestamp,
    createJob,
    updateJob,
    deleteJob,
    createScope,
    updateScope,
    deleteScope,
    createTakeoffPhase,
    deleteTakeoffPhase,
    saveTakeoffEntries,
    updateTakeoffEntry,
    deleteTakeoffEntry,
    updatePhaseMaterials,
    addDefaultScopesToJob,
    // Checklist functions
    createChecklist,
    updateChecklist,
    deleteChecklist,
    completeChecklist,
    saveChecklistTemplate,
    getChecklistTemplates,
    deleteChecklistTemplate,
    // Document functions
    uploadDocument,
    deleteDocument,
    updateDocument,
    // Daily log functions
    getLogsForJob,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    addAttachmentToLog,
    removeAttachmentFromLog,
    // Employee data from useTimeClock
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addToolDeduction,
    removeToolDeduction,
    bankHours,
    useBankedHours,
    updateEmployeeToolDeductions,
    addEmployeeDocument,
    removeEmployeeDocument,
    disableAutoSyncTemporarily,
    forceRecalculateLaborCosts
  } = useJobs();

  // Derive selectedJob from jobs array (after jobs is defined)
  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  // Update selectedJob whenever jobs array changes
  useEffect(() => {
    // Job data updated, selectedJob will be derived automatically
  }, [jobs, selectedJobId, jobsUpdateTimestamp]);



  // Update selectedJobId when jobs are deleted
  const handleJobDeleted = useCallback((jobId) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      setCurrentJobView('jobs');
    }
  }, [selectedJobId]);

  const handleJobCreated = useCallback(() => {
    setCurrentJobView('jobs');
  }, []);

  const handleJobUpdated = useCallback((jobId, updates) => {
    // Update selectedJob if it's the same job being updated
    if (selectedJobId === jobId) {
      // Don't force a refresh - let the jobs array change trigger the update naturally
    }
    
    // Handle status updates that should redirect to jobs list
    if (updates.status && currentJobView === 'job-details') {
        setCurrentJobView('jobs'); 
        setSelectedJobId(null);
    }
  }, [currentJobView, selectedJobId]);

  const handleScopeCreated = useCallback(() => {
    setIsCreateScopeModalOpen(false);
  }, []);

  const handleScopeUpdated = useCallback((scopeId, updates) => {
    if (selectedScope && selectedScope.id === scopeId) {
      setSelectedScope(prev => ({ ...prev, ...updates }));
    }
  }, [selectedScope]);
  
  const handleScopeDeleted = useCallback((jobId, scopeId) => {
    if (selectedScope && selectedScope.id === scopeId) {
        setSelectedScope(null);
        setCurrentJobView('job-details'); 
    }
  }, [selectedScope]);

  const handleTakeoffPhaseCreated = useCallback(() => {
    setCurrentJobView('job-details');
  }, []);

  const handleTakeoffPhaseDeleted = useCallback((jobId, phaseId) => {
    // If we're currently viewing a job, stay on the job details page
    if (selectedJobId === jobId) {
      setCurrentJobView('job-details');
    }
  }, [selectedJobId]);

  const handleTakeoffEntriesSaved = useCallback(() => {
    setCurrentJobView('job-details');
  }, []);

  const handleTakeoffEntryUpdated = useCallback(() => {
    // Job will be updated automatically via useEffect
  }, []);

  const handleTakeoffEntryDeleted = useCallback(() => {
    // Job will be updated automatically via useEffect
  }, []);

  const handlePhaseMaterialsUpdated = useCallback(() => {
    // Job will be updated automatically via useEffect
  }, []);

  const handleAddDefaultScopes = useCallback((jobId) => {
    console.log('=== handleAddDefaultScopes called ===');
    console.log('JobId:', jobId);
    console.log('addDefaultScopesToJob function:', addDefaultScopesToJob);
    
    // Add a small delay to ensure the job is properly saved to state
    setTimeout(() => {
      console.log('=== Calling addDefaultScopesToJob ===');
      addDefaultScopesToJob(jobId);
    }, 100);
  }, [addDefaultScopesToJob]); // Force refresh

  const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  };

  const goToScheduleForJob = useCallback((jobId) => {
    setScheduleInitialJobId(jobId);
    setCurrentMainView('schedule');
  }, []);

  const renderHeader = () => (
    <motion.header 
      className="gradient-bg text-white p-4 md:p-6 shadow-2xl sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
            {(currentMainView !== 'jobs' || (currentMainView === 'jobs' && currentJobView !== 'jobs')) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (currentMainView === 'jobs') {
                    // Handle job sub-navigation
                    if (currentJobView === 'scope-details' || currentJobView === 'create-takeoff' || currentJobView === 'create-takeoff-phase' || currentJobView === 'create-scope' || currentJobView === 'job-financials') {
                      setCurrentJobView('job-details');
                      setSelectedScope(null);
                      setSelectedTakeoffPhaseId(null);
                      setIsCreateScopeModalOpen(false);
                    } else {
                      setCurrentJobView('jobs');
                      setSelectedJobId(null);
                      setSelectedScope(null);
                      setSelectedTakeoffPhaseId(null);
                      setIsCreateScopeModalOpen(false);
                    }
                  } else {
                    // Return to main jobs view
                    setCurrentMainView('jobs');
                    setCurrentJobView('jobs');
                    setSelectedJobId(null);
                    setSelectedScope(null);
                    setSelectedTakeoffPhaseId(null);
                    setIsCreateScopeModalOpen(false);
                  }
                }}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5"  />
              </Button>
            )}
            
            {/* Logo - Fixed width to prevent compression */}
            <div className="flex-shrink-0">
              <div className="bg-white p-1 md:p-2 rounded-md">
               <img src="/Logo.png" alt="HSH Contractor" className="h-10 md:h-16" />
              </div>
            </div>

            {/* Main Jobs Button - Hidden when on Jobs Dashboard */}
            {currentMainView !== 'jobs' && (
              <div className="flex-shrink-0">
                <Button
                  onClick={() => {
                    setCurrentMainView('jobs');
                    setCurrentJobView('jobs');
                    setSelectedJobId(null);
                    setSelectedScope(null);
                    setSelectedTakeoffPhaseId(null);
                    setIsCreateScopeModalOpen(false);
                  }}
                  variant="ghost"
                  className="w-28 h-12 text-xs leading-tight text-white hover:bg-white/20"
                >
                  <Building2 className="h-4 w-4 mr-1 mb-1" />
                  <div className="text-center">
                    Project<br />Dashboard
                  </div>
                </Button>
              </div>
            )}
          </div>
        
        <div className="flex items-center space-x-4">
          {/* Main Navigation Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Operations Dropdown */}
            <NavigationDropdown
              label="Operations"
              icon={Warehouse}
              currentView={currentMainView}
              onSelect={setCurrentMainView}
              items={[
                { value: 'time-clock', label: 'Time Clock', icon: Clock },
                { value: 'schedule', label: 'Schedule', icon: Calendar },
                { value: 'inventory', label: 'Inventory', icon: Warehouse },
                { value: 'supplier-management', label: 'Supplier Management', icon: Truck },
                { value: 'client-portal', label: 'Client Portal', icon: Globe }
              ]}
            />

            {/* HR Dropdown */}
            <NavigationDropdown
              label="HR"
              icon={UsersIcon}
              currentView={currentMainView}
              onSelect={setCurrentMainView}
              items={[
                { value: 'labor-management', label: 'Labor Management', icon: Users },
                { value: 'payroll', label: 'Payroll', icon: DollarSign }
              ]}
            />

            {/* Finance Dropdown */}
            <NavigationDropdown
              label="Finance"
              icon={Calculator}
              currentView={currentMainView}
              onSelect={setCurrentMainView}
              items={[
                { value: 'analytics', label: 'Analytics', icon: BarChart3 },
                { value: 'cash-flow', label: 'Cash Flow', icon: TrendingUp },
                { value: 'invoice-processing', label: 'Invoice Processing', icon: FileText },
                { value: 'material-pricing', label: 'Material Pricing', icon: DollarSignIcon },
                { value: 'quickbooks', label: 'QuickBooks', icon: Building2Icon },
                { value: 'commercial-project-manager', label: 'Commercial PM', icon: Bot }
              ]}
            />
            

            
            <Button
              onClick={() => setShowDataManager(true)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Database className="h-5 w-5" />
            </Button>
          </div>

          {currentMainView === 'jobs' && currentJobView === 'jobs' && (
            <Button
              onClick={() => setCurrentJobView('create-job')}
              className="bg-white text-brandPrimary hover:bg-brandPrimary hover:text-white font-semibold transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          )}
          
          {/* User menu */}
          <div className="flex items-center space-x-3">
            <span className="text-white/80 text-xs md:text-sm hidden sm:block">
              Welcome, {getUserData()?.firstName || 'User'}
            </span>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      );
    }

    // Main view router
    if (currentMainView === 'time-clock') {
      return <TimeClock employees={employees} />;
    }
    
    if (currentMainView === 'labor-management') {
      return <LaborManagement 
        employees={employees}
        addEmployee={addEmployee}
        updateEmployee={updateEmployee}
        deleteEmployee={deleteEmployee}
        addToolDeduction={addToolDeduction}
        removeToolDeduction={removeToolDeduction}
        bankHours={bankHours}
        useBankedHours={useBankedHours}
        updateEmployeeToolDeductions={updateEmployeeToolDeductions}
        addEmployeeDocument={addEmployeeDocument}
        removeEmployeeDocument={removeEmployeeDocument}
      />;
    }

    if (currentMainView === 'payroll') {
      return <PayrollDashboard 
        employees={employees}
      />;
    }

    if (currentMainView === 'schedule') {
      return <ScheduleDashboardWithProvider employees={employees} initialJobId={scheduleInitialJobId} />;
    }

    if (currentMainView === 'analytics') {
      return <AnalyticsDashboard jobs={jobs} employees={employees} />;
    }

    if (currentMainView === 'invoice-processing') {
      return <InvoiceProcessingPanel jobs={jobs} onJobSelect={(jobId) => {
        setSelectedJobId(jobId);
        setCurrentMainView('jobs');
        setCurrentJobView('job-details');
      }} />;
    }
    if (currentMainView === 'material-pricing') {
      return <MaterialPricingPanel />;
    }
    if (currentMainView === 'inventory') {
      return <InventoryManagementPanel jobs={jobs} />;
    }

    if (currentMainView === 'cash-flow') {
      return <CashFlowPanel jobs={jobs} />;
    }

    if (currentMainView === 'supplier-management') {
      return <SupplierManagementPanel jobs={jobs} />;
    }

    if (currentMainView === 'client-portal') {
      return <ClientPortalPanel />;
    }

    if (currentMainView === 'quickbooks') {
      return <QuickBooksConnection />;
    }

    if (currentMainView === 'commercial-project-manager') {
      return <CommercialProjectManager jobs={jobs} />;
    }



    // Jobs view router
    switch (currentJobView) {
      case 'jobs':
        return (
          <JobsList 
            jobs={jobs}
            onSelectJob={(selectedJobItem) => {
              setSelectedJobId(selectedJobItem.id);
              setCurrentJobView('job-details');
            }}
            onDeleteJob={(jobId) => deleteJob(jobId, handleJobDeleted)}
            onUpdateJobStatus={(jobId, updates) => updateJob(jobId, updates, handleJobUpdated)}
          />
        );
      
      case 'create-job':
        return (
          <CreateJobForm 
            onSubmit={(data) => createJob(data, handleJobCreated)}
            onCancel={() => setCurrentJobView('jobs')}
            existingJobs={jobs}
          />
        );
      
      case 'job-details':
        return (
          <JobDetails 
            job={selectedJob}
            onUpdateJob={(jobId, updates) => updateJob(jobId, updates, handleJobUpdated)}
            onSelectScope={(scope) => {
              setSelectedScope(scope);
              setCurrentJobView('scope-details');
            }}
            onAddDefaultScopes={handleAddDefaultScopes}
            onCreateTakeoffPhase={() => setCurrentJobView('create-takeoff-phase')}
            onAddTakeoffEntry={(phaseId) => {
              setSelectedTakeoffPhaseId(phaseId);
              setCurrentJobView('create-takeoff');
            }}
            onDeleteScope={(scopeId) => deleteScope(selectedJob.id, scopeId, handleScopeDeleted)}
            onOpenCreateScopeModal={() => setIsCreateScopeModalOpen(true)}
            onUpdateTakeoffEntry={(phaseId, updatedEntry) => updateTakeoffEntry(selectedJob.id, phaseId, updatedEntry, handleTakeoffEntryUpdated)}
            onDeleteTakeoffEntry={(phaseId, entryId) => deleteTakeoffEntry(phaseId, entryId, handleTakeoffEntryDeleted)}
            onUpdatePhaseMaterials={(phaseId, materials) => updatePhaseMaterials(phaseId, materials, handlePhaseMaterialsUpdated)}
            onShowTakeoffReport={() => setShowTakeoffReportModal(true)}
            onShowFinancials={() => setCurrentJobView('job-financials')}
            onDeleteJob={(jobId) => deleteJob(jobId, handleJobDeleted)}
            onDeleteTakeoffPhase={(jobId, phaseId) => deleteTakeoffPhase(jobId, phaseId, handleTakeoffPhaseDeleted)}
            employees={employees}
            onGoToScheduleForJob={goToScheduleForJob}
            // Document props
            onUploadDocument={(jobId, document) => uploadDocument(jobId, document)}
            onDeleteDocument={(jobId, documentId) => deleteDocument(jobId, documentId)}
            onUpdateDocument={(jobId, documentId, updates) => updateDocument(jobId, documentId, updates)}
            // Daily log props
            onGetLogsForJob={(jobId) => getLogsForJob(jobId)}
            onAddLogEntry={(jobId, logData) => addLogEntry(jobId, logData)}
            onUpdateLogEntry={(jobId, logId, updates) => updateLogEntry(jobId, logId, updates)}
            onDeleteLogEntry={(jobId, logId) => deleteLogEntry(jobId, logId)}
            onAddAttachmentToLog={(jobId, logId, attachment) => addAttachmentToLog(jobId, logId, attachment)}
            onRemoveAttachmentFromLog={(jobId, logId, attachmentId) => removeAttachmentFromLog(jobId, logId, attachmentId)}
          />
        );

      case 'job-financials':
        return (
          <JobFinancials
            job={selectedJob}
            onUpdateJob={(jobId, updates) => updateJob(jobId, updates, handleJobUpdated)}
            disableAutoSyncTemporarily={disableAutoSyncTemporarily}
            forceRecalculateLaborCosts={forceRecalculateLaborCosts}
          />
        );
      
      case 'scope-details':
        return (
          <ScopeDetails 
            scope={selectedScope}
            jobId={selectedJob?.id}
            onUpdateScope={(scopeId, updates) => updateScope(scopeId, updates, handleScopeUpdated)}
            onDeleteScope={(jobId, scopeId) => deleteScope(jobId, scopeId, handleScopeDeleted)}
            employees={employees}
          />
        );
      
      case 'create-takeoff-phase':
        return (
          <CreateTakeoffPhaseForm
            jobId={selectedJob.id}
            onSubmit={(jobId, data) => createTakeoffPhase(jobId, data, handleTakeoffPhaseCreated)}
            onCancel={() => setCurrentJobView('job-details')}
          />
        );

      case 'create-takeoff':
        return (
          <CreateTakeoffForm 
            jobId={selectedJob.id}
            phaseId={selectedTakeoffPhaseId}
            onSubmit={(jobId, phaseId, entryData, entries, notes) => saveTakeoffEntries(jobId, phaseId, entryData, entries, notes, handleTakeoffEntriesSaved)}
            onCancel={() => setCurrentJobView('job-details')}
          />
        );
      
      default:
        return <JobsList jobs={jobs} onSelectJob={setSelectedJobId} onDeleteJob={(jobId) => deleteJob(jobId, handleJobDeleted)} onUpdateJobStatus={(jobId, updates) => updateJob(jobId, updates, handleJobUpdated)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {renderHeader()}
      
      <main className="max-w-7xl mx-auto p-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentMainView}-${currentJobView}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {selectedJob && showTakeoffReportModal && (
        <TakeoffReportModal 
          job={selectedJob} 
          isOpen={showTakeoffReportModal} 
          onClose={() => setShowTakeoffReportModal(false)}
        />
      )}

      {isCreateScopeModalOpen && selectedJob && (
        <CreateScopeForm
          jobId={selectedJob.id}
          onSubmit={(jobId, data) => createScope(jobId, data, handleScopeCreated)}
          onCancel={() => setIsCreateScopeModalOpen(false)}
          existingScopes={selectedJob.scopes || []}
        />
      )}
      
      {showDataManager && (
        <DataManager
          onClose={() => setShowDataManager(false)}
        />
      )}

      <Toaster />
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16 px-4">
          {/* Left side - Jobs button */}
          <Button
            onClick={() => {
              setCurrentMainView('jobs');
              setCurrentJobView('jobs');
              setSelectedJobId(null);
              setSelectedScope(null);
              setSelectedTakeoffPhaseId(null);
              setIsCreateScopeModalOpen(false);
            }}
            variant="ghost"
            className="flex flex-col items-center space-y-1 h-12 px-3"
          >
            <Building2 className="h-5 w-5" />
            <span className="text-xs">Projects</span>
          </Button>

          {/* Center - Hamburger Menu */}
          <Button
            onClick={() => setShowMobileMenu(true)}
            variant="ghost"
            className="flex flex-col items-center space-y-1 h-12 px-3"
          >
            <div className="flex flex-col space-y-1">
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
            <span className="text-xs">Menu</span>
          </Button>

          {/* Right side - Data Manager */}
          <Button
            onClick={() => setShowDataManager(true)}
            variant="ghost"
            className="flex flex-col items-center space-y-1 h-12 px-3"
          >
            <Database className="h-5 w-5" />
            <span className="text-xs">Data</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Modal */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
              <Button
                onClick={() => setShowMobileMenu(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Operations Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Warehouse className="h-4 w-4 mr-2" />
                Operations
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setCurrentMainView('time-clock');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Clock className="h-5 w-5 mr-3" />
                  Time Clock
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('schedule');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Schedule
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('inventory');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Warehouse className="h-5 w-5 mr-3" />
                  Inventory
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('supplier-management');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Truck className="h-5 w-5 mr-3" />
                  Supplier Management
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('client-portal');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Globe className="h-5 w-5 mr-3" />
                  Client Portal
                </Button>
              </div>
            </div>

            {/* HR Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                HR
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setCurrentMainView('labor-management');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Users className="h-5 w-5 mr-3" />
                  Labor Management
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('payroll');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <DollarSign className="h-5 w-5 mr-3" />
                  Payroll
                </Button>
              </div>
            </div>

            {/* Finance Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Finance
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setCurrentMainView('analytics');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Analytics
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('cash-flow');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Cash Flow
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('invoice-processing');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Invoice Processing
                </Button>
                <Button
                  onClick={() => {
                    setCurrentMainView('material-pricing');
                    setShowMobileMenu(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <DollarSignIcon className="h-5 w-5 mr-3" />
                  Material Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
}

export default App;