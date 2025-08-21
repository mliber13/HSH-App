import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { addDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';

// Local storage key
const SCHEDULES_STORAGE_KEY = 'hsh_drywall_schedules';

// Helper functions for local storage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to get all dependent schedules (recursive)
const getDependentSchedules = (scheduleId, allSchedules) => {
  if (!scheduleId || !allSchedules) return [];
  
  const dependents = [];
  const queue = [scheduleId];
  const visited = new Set();
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    // Find all schedules that have this schedule as a predecessor
    const directDependents = allSchedules.filter(s => s.predecessorId === currentId);
    dependents.push(...directDependents);
    queue.push(...directDependents.map(s => s.id));
  }
  
  return dependents;
};

// Helper function to check for circular dependencies
const hasCircularDependency = (scheduleId, predecessorId, allSchedules) => {
  if (!scheduleId || !predecessorId || !allSchedules) return false;
  if (scheduleId === predecessorId) return true;
  
  const visited = new Set();
  const queue = [predecessorId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    const predecessor = allSchedules.find(s => s.id === currentId);
    if (predecessor && predecessor.predecessorId) {
      if (predecessor.predecessorId === scheduleId) return true;
      queue.push(predecessor.predecessorId);
    }
  }
  
  return false;
};

const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load schedules from localStorage on mount
  useEffect(() => {
    const savedSchedules = loadFromStorage(SCHEDULES_STORAGE_KEY, []);
    setSchedules(savedSchedules);
    setLoading(false);
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveToStorage(SCHEDULES_STORAGE_KEY, schedules);
    }
  }, [schedules, loading]);

  // ... (copy all the schedule logic from useSchedule.js here, using schedules/setSchedules)

  const checkForConflicts = useCallback((employeeIds, startDate, endDate, excludeScheduleId = null) => {
    const conflicts = [];
    schedules.forEach(schedule => {
      if (excludeScheduleId && schedule.id === excludeScheduleId) return;
      if (employeeIds.some(id => schedule.employeeIds.includes(id))) {
        const scheduleStart = createLocalDate(schedule.startDate);
        const scheduleEnd = createLocalDate(schedule.endDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (
          (start >= scheduleStart && start < scheduleEnd) ||
          (end > scheduleStart && end <= scheduleEnd) ||
          (start <= scheduleStart && end >= scheduleEnd)
        ) {
          conflicts.push({
            employeeId: schedule.employeeIds.find(id => employeeIds.includes(id)),
            conflictingSchedule: schedule
          });
        }
      }
    });
    return conflicts;
  }, [schedules]);

  const createSchedule = useCallback((scheduleData, callback) => {
    try {
      // Only check for conflicts if employees are assigned
      if (scheduleData.employeeIds && scheduleData.employeeIds.length > 0) {
        const conflicts = checkForConflicts(
          scheduleData.employeeIds,
          scheduleData.startDate,
          scheduleData.endDate
        );
        if (conflicts.length > 0) {
          toast({
            title: "Scheduling Conflict",
            description: "One or more employees already have assignments during this time period.",
            variant: "destructive"
          });
          return { success: false, conflicts };
        }
      }
          const newSchedule = {
      id: generateId(),
      ...scheduleData,
      predecessorId: scheduleData.predecessorId || null,
      predecessorLag: scheduleData.predecessorLag || 0,
      duration: scheduleData.duration || 1,
      useDuration: scheduleData.useDuration || false,
      status: scheduleData.status || "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
      setSchedules(prev => [...prev, newSchedule]);
      toast({
        title: "Schedule Created! 📅",
        description: `New schedule for "${scheduleData.title}" has been created.`
      });
      if (callback) callback(newSchedule);
      return { success: true, schedule: newSchedule };
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [checkForConflicts]);

  // Helper function to create local dates without timezone issues
  const createLocalDate = (dateString) => {
    if (typeof dateString === 'string') {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  };

  // Helper function to format date for storage
  const formatDateForStorage = (date) => {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  };

  const updateDependentSchedules = useCallback((scheduleId, newStartDate, newEndDate) => {
    setSchedules(prev => {
      const dependents = getDependentSchedules(scheduleId, prev);
      if (dependents.length === 0) return prev;
      
      const originalSchedule = prev.find(s => s.id === scheduleId);
      if (!originalSchedule) return prev;
      
      const originalStart = createLocalDate(originalSchedule.startDate);
      const originalEnd = createLocalDate(originalSchedule.endDate);
      const newStart = createLocalDate(newStartDate);
      const newEnd = createLocalDate(newEndDate);
      
      // Calculate the shift in days
      const startShift = Math.floor((newStart - originalStart) / (1000 * 60 * 60 * 24));
      const endShift = Math.floor((newEnd - originalEnd) / (1000 * 60 * 60 * 24));
      
      const updatedSchedules = prev.map(schedule => {
        if (dependents.some(d => d.id === schedule.id)) {
                     // If this schedule has a predecessor relationship with lag
           if (schedule.predecessorId === scheduleId) {
             const lagDays = schedule.predecessorLag || 0;
             
             // Create a proper date object from the new predecessor end date
             const [preYear, preMonth, preDay] = newEndDate.split('-').map(Number);
             const newPredecessorEnd = new Date(preYear, preMonth - 1, preDay, 12, 0, 0, 0);
             
             // Calculate new start date based on predecessor end + lag
             const newScheduleStart = new Date(newPredecessorEnd);
             newScheduleStart.setDate(newScheduleStart.getDate() + lagDays + 1); // +1 because 0 lag means next day
             
             // Calculate new end date based on duration or original duration
             let newScheduleEnd;
             if (schedule.useDuration && schedule.duration) {
               newScheduleEnd = new Date(newScheduleStart);
               newScheduleEnd.setDate(newScheduleEnd.getDate() + schedule.duration - 1);
             } else {
               // Use original duration calculation
               const originalDuration = Math.floor((createLocalDate(schedule.endDate) - createLocalDate(schedule.startDate)) / (1000 * 60 * 60 * 24)) + 1;
               newScheduleEnd = new Date(newScheduleStart);
               newScheduleEnd.setDate(newScheduleEnd.getDate() + originalDuration - 1);
             }
             
             return {
               ...schedule,
               startDate: formatDateForStorage(newScheduleStart),
               endDate: formatDateForStorage(newScheduleEnd),
               updatedAt: new Date().toISOString()
             };
                     } else {
             // Standard shift calculation for non-predecessor dependents
             const scheduleStart = createLocalDate(schedule.startDate);
             const scheduleEnd = createLocalDate(schedule.endDate);
             
             const newScheduleStart = new Date(scheduleStart);
             newScheduleStart.setDate(newScheduleStart.getDate() + startShift);
             
             const newScheduleEnd = new Date(scheduleEnd);
             newScheduleEnd.setDate(newScheduleEnd.getDate() + endShift);
             
             return {
               ...schedule,
               startDate: formatDateForStorage(newScheduleStart),
               endDate: formatDateForStorage(newScheduleEnd),
               updatedAt: new Date().toISOString()
             };
           }
        }
        return schedule;
      });
      
      if (dependents.length > 0) {
        toast({
          title: "Dependent Schedules Updated! 🔗",
          description: `${dependents.length} dependent schedule${dependents.length > 1 ? 's' : ''} have been automatically adjusted.`
        });
      }
      
      return updatedSchedules;
    });
  }, []);

  const updateSchedule = useCallback((scheduleId, updates, callback) => {
    try {
      const existingSchedule = schedules.find(s => s.id === scheduleId);
      if (!existingSchedule) {
        toast({
          title: "Error",
          description: "Schedule not found.",
          variant: "destructive"
        });
        return { success: false };
      }
      if (
        (updates.startDate && updates.startDate !== existingSchedule.startDate) ||
        (updates.endDate && updates.endDate !== existingSchedule.endDate) ||
        (updates.employeeIds && JSON.stringify(updates.employeeIds) !== JSON.stringify(existingSchedule.employeeIds))
      ) {
        const conflicts = checkForConflicts(
          updates.employeeIds || existingSchedule.employeeIds,
          updates.startDate || existingSchedule.startDate,
          updates.endDate || existingSchedule.endDate,
          scheduleId
        );
        if (conflicts.length > 0) {
          toast({
            title: "Scheduling Conflict",
            description: "One or more employees already have assignments during this time period.",
            variant: "destructive"
          });
          return { success: false, conflicts };
        }
      }
      
      // Update the schedule
      setSchedules(prev => prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
          : schedule
      ));
      
      // If dates changed, update dependent schedules
      if ((updates.startDate && updates.startDate !== existingSchedule.startDate) ||
          (updates.endDate && updates.endDate !== existingSchedule.endDate)) {
        updateDependentSchedules(scheduleId, updates.startDate || existingSchedule.startDate, updates.endDate || existingSchedule.endDate);
      }
      
      toast({
        title: "Schedule Updated! ✅",
        description: "Schedule has been updated successfully."
      });
      if (callback) callback(scheduleId, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [schedules, checkForConflicts, updateDependentSchedules]);

  const deleteSchedule = useCallback((scheduleId, callback) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    toast({
      title: "Schedule Deleted! 🗑️",
      description: "The schedule has been removed.",
      variant: "destructive"
    });
    if (callback) callback(scheduleId);
    return { success: true };
  }, []);

  const getJobSchedules = useCallback((jobId) => {
    return schedules.filter(schedule => schedule.jobId === jobId);
  }, [schedules]);

  const getEmployeeSchedules = useCallback((employeeId) => {
    return schedules.filter(schedule => schedule.employeeIds.includes(employeeId));
  }, [schedules]);

  const getSchedulesInDateRange = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return schedules.filter(schedule => {
      const scheduleStart = createLocalDate(schedule.startDate);
      const scheduleEnd = createLocalDate(schedule.endDate);
      return (
        (scheduleStart >= start && scheduleStart <= end) ||
        (scheduleEnd >= start && scheduleEnd <= end) ||
        (scheduleStart <= start && scheduleEnd >= end)
      );
    });
  }, [schedules]);

  const getSchedulesForDay = useCallback((date) => {
    const targetDate = new Date(date);
    return schedules.filter(schedule => {
      const scheduleStart = createLocalDate(schedule.startDate);
      const scheduleEnd = createLocalDate(schedule.endDate);
      return isWithinInterval(targetDate, { start: scheduleStart, end: scheduleEnd }) ||
        isSameDay(targetDate, scheduleStart) ||
        isSameDay(targetDate, scheduleEnd);
    });
  }, [schedules]);

  const getCalendarEvents = useCallback((jobs = [], employees = []) => {
    return schedules.map(schedule => {
      const job = jobs.find(j => j.id === schedule.jobId) || {};
      const assignedEmployees = schedule.employeeIds
        .map(id => employees.find(e => e.id === id))
        .filter(Boolean);
      const employeeNames = assignedEmployees
        .map(e => `${e.firstName} ${e.lastName}`)
        .join(', ');
      let backgroundColor;
      switch (schedule.status) {
        case 'completed':
          backgroundColor = '#22c55e';
          break;
        case 'in-progress':
          backgroundColor = '#eab308';
          break;
        case 'cancelled':
          backgroundColor = '#ef4444';
          break;
        default:
          backgroundColor = '#5c8ceb';
      }
      
      // Fix timezone issue when creating Date objects for display
      const createDisplayDate = (dateString) => {
        if (typeof dateString === 'string') {
          const [year, month, day] = dateString.split('-').map(Number);
          return new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon to avoid timezone shifts
        }
        return new Date(dateString);
      };
      
      return {
        id: schedule.id,
        title: schedule.title,
        start: createDisplayDate(schedule.startDate),
        end: createDisplayDate(schedule.endDate),
        allDay: true,
        jobName: job.jobName || 'Unknown Job',
        jobId: schedule.jobId,
        employeeIds: schedule.employeeIds,
        employeeNames,
        notes: schedule.notes,
        status: schedule.status,
        predecessorId: schedule.predecessorId,
        backgroundColor,
        borderColor: backgroundColor
      };
    });
  }, [schedules]);

  const value = {
    schedules,
    loading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getJobSchedules,
    getEmployeeSchedules,
    getSchedulesInDateRange,
    getSchedulesForDay,
    getCalendarEvents,
    checkForConflicts,
    updateDependentSchedules,
    getDependentSchedules: (scheduleId) => getDependentSchedules(scheduleId, schedules),
    hasCircularDependency: (scheduleId, predecessorId) => hasCircularDependency(scheduleId, predecessorId, schedules)
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
} 