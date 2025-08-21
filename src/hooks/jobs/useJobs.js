import { useCallback } from 'react';
import { useTimeClock } from '@/hooks/useTimeClock';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import useDailyLogs from '@/hooks/useDailyLogs';
import { useJobCore } from './useJobCore';
import { useJobScopes } from './useJobScopes';
import { useJobLaborCosts } from './useJobLaborCosts';

export const useJobs = () => {
  // Core job management
  const {
    jobs,
    loading,
    jobsUpdateTimestamp,
    createJob,
    updateJob,
    deleteJob,
    loadJobs
  } = useJobCore();

  // Get data from other hooks
  const { timeEntries, pieceRateEntries } = useTimeClock();
  const {
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
    removeEmployeeDocument
  } = useEmployeeData();

  // Daily logs functionality
  const {
    getLogsForJob,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    addAttachmentToLog,
    removeAttachmentFromLog
  } = useDailyLogs();

  // Scope management
  const {
    createScope,
    updateScope,
    deleteScope
  } = useJobScopes(jobs, updateJob);

  // Labor cost calculations
  const {
    calculateLaborCostsForSingleJob,
    recalculateAllJobLaborCosts,
    resetAllJobLaborCosts
  } = useJobLaborCosts();

  // Recalculate all job labor costs when time entries or employees change
  const recalculateAllJobLaborCostsWithDependencies = useCallback(() => {
    recalculateAllJobLaborCosts(jobs, timeEntries, pieceRateEntries, employees, updateJob);
  }, [jobs, timeEntries, pieceRateEntries, employees, updateJob, recalculateAllJobLaborCosts]);

  // Add default scopes to a job
  const addDefaultScopesToJob = useCallback((jobId, callback) => {
    try {
      const defaultScopes = [
        {
          name: 'Main Scope',
          description: 'Primary drywall installation work',
          type: 'main'
        },
        {
          name: 'Prep Work',
          description: 'Preparation and setup work',
          type: 'prep'
        },
        {
          name: 'Clean Up',
          description: 'Post-installation cleanup',
          type: 'cleanup'
        }
      ];

      defaultScopes.forEach(scope => {
        createScope(jobId, scope);
      });

      if (callback) callback();
    } catch (error) {
      console.error('Error adding default scopes:', error);
      if (callback) callback(error);
    }
  }, [createScope]);

  return {
    // Core state
    jobs,
    loading,
    jobsUpdateTimestamp,
    
    // Core functions
    createJob,
    updateJob,
    deleteJob,
    loadJobs,
    
    // Scope functions
    createScope,
    updateScope,
    deleteScope,
    addDefaultScopesToJob,
    
    // Labor cost functions
    calculateLaborCostsForSingleJob,
    recalculateAllJobLaborCosts: recalculateAllJobLaborCostsWithDependencies,
    resetAllJobLaborCosts,
    
    // Employee functions (passed through)
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
    
    // Daily log functions (passed through)
    getLogsForJob,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    addAttachmentToLog,
    removeAttachmentFromLog,
    
    // Placeholder functions for other features (to be implemented in separate hooks)
    createTakeoffPhase: () => {},
    deleteTakeoffPhase: () => {},
    saveTakeoffEntries: () => {},
    updateTakeoffEntry: () => {},
    deleteTakeoffEntry: () => {},
    updatePhaseMaterials: () => {},
    createChecklist: () => {},
    updateChecklist: () => {},
    deleteChecklist: () => {},
    completeChecklist: () => {},
    saveChecklistTemplate: () => {},
    getChecklistTemplates: () => {},
    deleteChecklistTemplate: () => {},
    uploadDocument: () => {},
    deleteDocument: () => {},
    updateDocument: () => {},
    calculateJobTakeoffSqft: () => {},
    updateJobFieldRevisedSqft: () => {},
    recalculateFieldRevisedDrywallMaterialCost: () => {},
    recalculatePhaseMaterials: () => {}
  };
};
