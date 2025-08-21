import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { storage, STORAGE_KEYS, generateId } from '@/lib/utils';

export default function useDailyLogs() {
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load logs from localStorage on mount
  useEffect(() => {
    const stored = storage.load(STORAGE_KEYS.DAILY_LOGS, [], 'dailyLogs');
    setDailyLogs(stored);
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    storage.save(STORAGE_KEYS.DAILY_LOGS, dailyLogs, 'dailyLogs');
  }, [dailyLogs]);

  // Get logs for a specific job
  const getLogsForJob = (jobId) => {
    try {
      if (!jobId) {
        console.warn('getLogsForJob called without jobId');
        return [];
      }
      return dailyLogs[jobId] || [];
    } catch (error) {
      console.error('Error in getLogsForJob:', error);
      return [];
    }
  };

  // Add a new log entry
  const addLogEntry = (jobId, logEntry) => {
    try {
      if (!jobId) {
        console.error('addLogEntry called without jobId');
        return null;
      }
      
      const newEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        ...logEntry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDailyLogs(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), newEntry]
      }));

      return newEntry;
    } catch (error) {
      console.error('Error in addLogEntry:', error);
      return null;
    }
  };

  // Update an existing log entry
  const updateLogEntry = (jobId, logId, updates) => {
    setDailyLogs(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map(log => 
        log.id === logId 
          ? { ...log, ...updates, updatedAt: new Date().toISOString() }
          : log
      )
    }));
  };

  // Delete a log entry
  const deleteLogEntry = (jobId, logId) => {
    setDailyLogs(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).filter(log => log.id !== logId)
    }));
  };

  // Add attachment to a log entry
  const addAttachmentToLog = (jobId, logId, attachment) => {
    const newAttachment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      ...attachment,
      uploadedAt: new Date().toISOString()
    };

    setDailyLogs(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map(log => 
        log.id === logId 
          ? { 
              ...log, 
              attachments: [...(log.attachments || []), newAttachment],
              updatedAt: new Date().toISOString()
            }
          : log
      )
    }));

    return newAttachment;
  };

  // Remove attachment from a log entry
  const removeAttachmentFromLog = (jobId, logId, attachmentId) => {
    setDailyLogs(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map(log => 
        log.id === logId 
          ? { 
              ...log, 
              attachments: (log.attachments || []).filter(att => att.id !== attachmentId),
              updatedAt: new Date().toISOString()
            }
          : log
      )
    }));
  };

  return {
    dailyLogs,
    loading,
    getLogsForJob,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    addAttachmentToLog,
    removeAttachmentFromLog
  };
}; 