import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { storage, STORAGE_KEYS, generateId } from '@/lib/utils';

export const useJobCore = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsUpdateTimestamp, setJobsUpdateTimestamp] = useState(Date.now());

  // Load jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = storage.load(STORAGE_KEYS.JOBS, [], 'jobs');
    setJobs([...savedJobs]);
    setLoading(false);
    setJobsUpdateTimestamp(Date.now());
  }, []);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    if (!loading) {
      storage.save(STORAGE_KEYS.JOBS, jobs, 'jobs');
    }
  }, [jobs, loading]);

  // Create a new job
  const createJob = useCallback((jobData, callback) => {
    try {
      const newJob = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...jobData,
        financials: {
          estimate: {
            sqft: 0,
            drywallMaterialRate: 0.66,
            hangerRate: 0.27,
            finisherRate: 0.27,
            prepCleanRate: 0.03,
            drywallSalesTaxRate: 0,
            totalEstimateAmount: 0,
            ...jobData.financials?.estimate
          },
          fieldRevised: {
            sqft: 0,
            drywallMaterialRate: 0.66,
            hangerRate: 0.27,
            finisherRate: 0.27,
            prepCleanRate: 0.03,
            ...jobData.financials?.fieldRevised
          },
          actual: {
            materialCost: 0,
            laborCost: 0,
            totalCost: 0,
            profit: 0,
            ...jobData.financials?.actual
          },
          changeOrders: [],
          materialInvoices: [],
          ...jobData.financials
        },
        scopes: [],
        takeoffs: [],
        checklists: [],
        documents: [],
        dailyLogs: [],
        ...jobData
      };

      setJobs(prevJobs => {
        const updatedJobs = [...prevJobs, newJob];
        return updatedJobs;
      });

      setJobsUpdateTimestamp(Date.now());
      
      toast({
        title: "Job Created",
        description: `Job "${newJob.jobName}" has been created successfully.`,
      });

      if (callback) callback(newJob);
      return newJob;
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
      if (callback) callback(null, error);
      return null;
    }
  }, []);

  // Update an existing job
  const updateJob = useCallback((jobId, updates, callback) => {
    try {
      setJobs(prevJobs => {
        const jobIndex = prevJobs.findIndex(job => job.id === jobId);
        if (jobIndex === -1) {
          throw new Error('Job not found');
        }

        const updatedJob = {
          ...prevJobs[jobIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const updatedJobs = [...prevJobs];
        updatedJobs[jobIndex] = updatedJob;
        return updatedJobs;
      });

      setJobsUpdateTimestamp(Date.now());
      
      toast({
        title: "Job Updated",
        description: "Job has been updated successfully.",
      });

      if (callback) callback();
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
      if (callback) callback(error);
    }
  }, []);

  // Delete a job
  const deleteJob = useCallback((jobId, callback) => {
    try {
      setJobs(prevJobs => {
        const filteredJobs = prevJobs.filter(job => job.id !== jobId);
        return filteredJobs;
      });

      setJobsUpdateTimestamp(Date.now());
      
      toast({
        title: "Job Deleted",
        description: "Job has been deleted successfully.",
      });

      if (callback) callback();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
      if (callback) callback(error);
    }
  }, []);

  // Load jobs (refresh from storage)
  const loadJobs = useCallback(() => {
    const savedJobs = storage.load(STORAGE_KEYS.JOBS, [], 'jobs');
    setJobs([...savedJobs]);
    setJobsUpdateTimestamp(Date.now());
  }, []);

  return {
    // State
    jobs,
    loading,
    jobsUpdateTimestamp,
    
    // Functions
    createJob,
    updateJob,
    deleteJob,
    loadJobs
  };
};
