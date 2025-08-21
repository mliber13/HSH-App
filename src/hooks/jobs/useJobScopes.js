import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { generateId } from '@/lib/utils';

export const useJobScopes = (jobs, updateJob) => {
  // Create a new scope for a job
  const createScope = useCallback((jobId, scopeData, callback) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const newScope = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...scopeData
      };

      const updatedScopes = [...(job.scopes || []), newScope];
      
      updateJob(jobId, {
        scopes: updatedScopes
      });

      toast({
        title: "Scope Created",
        description: `Scope "${newScope.name}" has been created successfully.`,
      });

      if (callback) callback(newScope);
      return newScope;
    } catch (error) {
      console.error('Error creating scope:', error);
      toast({
        title: "Error",
        description: "Failed to create scope. Please try again.",
        variant: "destructive",
      });
      if (callback) callback(null, error);
      return null;
    }
  }, [jobs, updateJob]);

  // Update an existing scope
  const updateScope = useCallback((scopeId, updates, callback) => {
    try {
      const job = jobs.find(j => j.scopes?.some(s => s.id === scopeId));
      if (!job) {
        throw new Error('Scope not found');
      }

      const updatedScopes = job.scopes.map(scope => 
        scope.id === scopeId 
          ? { ...scope, ...updates, updatedAt: new Date().toISOString() }
          : scope
      );

      updateJob(job.id, {
        scopes: updatedScopes
      });

      toast({
        title: "Scope Updated",
        description: "Scope has been updated successfully.",
      });

      if (callback) callback();
    } catch (error) {
      console.error('Error updating scope:', error);
      toast({
        title: "Error",
        description: "Failed to update scope. Please try again.",
        variant: "destructive",
      });
      if (callback) callback(error);
    }
  }, [jobs, updateJob]);

  // Delete a scope
  const deleteScope = useCallback((jobId, scopeId, callback) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      const updatedScopes = job.scopes.filter(scope => scope.id !== scopeId);
      
      updateJob(jobId, {
        scopes: updatedScopes
      });

      toast({
        title: "Scope Deleted",
        description: "Scope has been deleted successfully.",
      });

      if (callback) callback();
    } catch (error) {
      console.error('Error deleting scope:', error);
      toast({
        title: "Error",
        description: "Failed to delete scope. Please try again.",
        variant: "destructive",
      });
      if (callback) callback(error);
    }
  }, [jobs, updateJob]);

  return {
    createScope,
    updateScope,
    deleteScope
  };
};
