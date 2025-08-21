import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { addDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { storage, STORAGE_KEYS, generateId } from '@/lib/utils';

// Remove ScheduleProvider and ScheduleContext from this file. Only keep the useSchedule hook and logic.

export function useSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load schedules from localStorage on mount
  useEffect(() => {
    const savedSchedules = storage.load(STORAGE_KEYS.SCHEDULES, [], 'schedules');
    setSchedules(savedSchedules);
    setLoading(false);
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      storage.save(STORAGE_KEYS.SCHEDULES, schedules, 'schedules');
    }
  }, [schedules, loading]);

  // Check for scheduling conflicts
  const checkForConflicts = useCallback((employeeIds, startDate, endDate, excludeScheduleId = null) => {
    const conflicts = [];

    employeeIds.forEach(employeeId => {
      const employeeSchedules = schedules.filter(
        schedule => 
          schedule.employeeIds.includes(employeeId) && 
          (excludeScheduleId ? schedule.id !== excludeScheduleId : true)
      );

      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      employeeSchedules.forEach(schedule => {
        const scheduleStart = new Date(schedule.startDate);
        const scheduleEnd = new Date(schedule.endDate);

        // Check if there's an overlap
        if (
          (startDateTime >= scheduleStart && startDateTime < scheduleEnd) ||
          (endDateTime > scheduleStart && endDateTime <= scheduleEnd) ||
          (startDateTime <= scheduleStart && endDateTime >= scheduleEnd)
        ) {
          conflicts.push({
            employeeId,
            conflictingSchedule: schedule
          });
        }
      });
    });

    return conflicts;
  }, [schedules]);

  // Create a new schedule
  const createSchedule = useCallback((scheduleData, callback) => {
    // Check for conflicts
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

    const newSchedule = {
      id: generateId(),
      ...scheduleData,
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
  }, [checkForConflicts]);

  // Update an existing schedule
  const updateSchedule = useCallback((scheduleId, updates, callback) => {
    const existingSchedule = schedules.find(s => s.id === scheduleId);
    if (!existingSchedule) {
      toast({
        title: "Error",
        description: "Schedule not found.",
        variant: "destructive"
      });
      return { success: false };
    }

    // Check for conflicts if dates or employees changed
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

    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
        : schedule
    ));

    toast({
      title: "Schedule Updated! ✅",
      description: "Schedule has been updated successfully."
    });

    if (callback) callback(scheduleId, updates);
    return { success: true };
  }, [schedules, checkForConflicts]);

  // Delete a schedule
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

  // Get schedules for a specific job
  const getJobSchedules = useCallback((jobId) => {
    return schedules.filter(schedule => schedule.jobId === jobId);
  }, [schedules]);

  // Get schedules for a specific employee
  const getEmployeeSchedules = useCallback((employeeId) => {
    return schedules.filter(schedule => schedule.employeeIds.includes(employeeId));
  }, [schedules]);

  // Get schedules for a specific date range
  const getSchedulesInDateRange = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return schedules.filter(schedule => {
      const scheduleStart = new Date(schedule.startDate);
      const scheduleEnd = new Date(schedule.endDate);

      return (
        (scheduleStart >= start && scheduleStart <= end) ||
        (scheduleEnd >= start && scheduleEnd <= end) ||
        (scheduleStart <= start && scheduleEnd >= end)
      );
    });
  }, [schedules]);

  // Get schedules for a specific day
  const getSchedulesForDay = useCallback((date) => {
    const targetDate = new Date(date);
    
    return schedules.filter(schedule => {
      const scheduleStart = new Date(schedule.startDate);
      const scheduleEnd = new Date(schedule.endDate);
      
      // Check if the target date falls within the schedule's date range
      return isWithinInterval(targetDate, { start: scheduleStart, end: scheduleEnd }) ||
             isSameDay(targetDate, scheduleStart) || 
             isSameDay(targetDate, scheduleEnd);
    });
  }, [schedules]);

  // Format schedules for the calendar view
  const getCalendarEvents = useCallback((jobs = [], employees = []) => {
    return schedules.map(schedule => {
      const job = jobs.find(j => j.id === schedule.jobId) || {};
      const assignedEmployees = schedule.employeeIds
        .map(id => employees.find(e => e.id === id))
        .filter(Boolean);
      
      const employeeNames = assignedEmployees
        .map(e => `${e.firstName} ${e.lastName}`)
        .join(', ');

      // Determine color based on status
      let backgroundColor;
      switch (schedule.status) {
        case 'completed':
          backgroundColor = '#22c55e'; // green-500
          break;
        case 'in-progress':
          backgroundColor = '#eab308'; // yellow-500
          break;
        case 'cancelled':
          backgroundColor = '#ef4444'; // red-500
          break;
        default:
          backgroundColor = '#5c8ceb'; // brandSecondary
      }

      return {
        id: schedule.id,
        title: schedule.title,
        start: new Date(schedule.startDate),
        end: new Date(schedule.endDate),
        allDay: true,
        jobName: job.jobName || 'Unknown Job',
        jobId: schedule.jobId,
        employeeIds: schedule.employeeIds,
        employeeNames,
        notes: schedule.notes,
        status: schedule.status,
        backgroundColor,
        borderColor: backgroundColor
      };
    });
  }, [schedules]);

  return {
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
    checkForConflicts
  };
}