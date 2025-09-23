import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { storage, STORAGE_KEYS, generateId } from '@/lib/utils';

export function useTimeClock() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [pieceRateEntries, setPieceRateEntries] = useState([]);
  const [payrollEntries, setPayrollEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get employee data from the dedicated hook
  const { employees, updateEmployeeToolDeductions } = useEmployeeData();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTimeEntries = storage.load(STORAGE_KEYS.TIME_ENTRIES, [], 'timeEntries');
    const savedPieceRateEntries = storage.load(STORAGE_KEYS.PIECE_RATE_ENTRIES, [], 'pieceRateEntries');
    const savedPayrollEntries = storage.load(STORAGE_KEYS.PAYROLL_ENTRIES, [], 'payrollEntries');

    setTimeEntries(savedTimeEntries);
    setPieceRateEntries(savedPieceRateEntries);
    setPayrollEntries(savedPayrollEntries);
    setLoading(false);
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      storage.save(STORAGE_KEYS.TIME_ENTRIES, timeEntries, 'timeEntries');
    }
  }, [timeEntries, loading]);

  useEffect(() => {
    if (!loading) {
      storage.save(STORAGE_KEYS.PIECE_RATE_ENTRIES, pieceRateEntries, 'pieceRateEntries');
    }
  }, [pieceRateEntries, loading]);

  // Debug effect to monitor pieceRateEntries changes
  useEffect(() => {
    console.log('=== PIECE RATE ENTRIES CHANGED ===');
    console.log('pieceRateEntries length:', pieceRateEntries.length);
    console.log('pieceRateEntries:', pieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, status: e.status })));
  }, [pieceRateEntries]);

  // Debug effect to monitor timeEntries changes
  useEffect(() => {
    console.log('=== TIME ENTRIES CHANGED ===');
    console.log('timeEntries length:', timeEntries.length);
    console.log('timeEntries:', timeEntries.map(e => ({ id: e.id, employeeId: e.employeeId, jobId: e.jobId, clockOutTime: e.clockOutTime })));
  }, [timeEntries]);

  useEffect(() => {
    if (!loading) {
      storage.save(STORAGE_KEYS.PAYROLL_ENTRIES, payrollEntries, 'payrollEntries');
    }
  }, [payrollEntries, loading]);

  // Clear all time entries and piece rate entries
  const clearAllTimeEntries = useCallback(() => {
    console.log('=== CLEARING ALL TIME ENTRIES ===');
    
    setTimeEntries([]);
    setPieceRateEntries([]);
    setPayrollEntries([]);
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('_hang_progress') || key.includes('_coat_progress')) {
        localStorage.removeItem(key);
        console.log('Removed progress key:', key);
      }
    });
    
    storage.save(STORAGE_KEYS.TIME_ENTRIES, [], 'timeEntries');
    storage.save(STORAGE_KEYS.PIECE_RATE_ENTRIES, [], 'pieceRateEntries');
    storage.save(STORAGE_KEYS.PAYROLL_ENTRIES, [], 'payrollEntries');
    
    toast({
      title: "All Time Entries Cleared! 🧹",
      description: "All time entries, piece rate entries, payroll reports, and progress data have been cleared. Starting fresh!"
    });
    
    console.log('=== END CLEARING ===');
  }, []);

  // New comprehensive clear function that also resets job labor costs
  const resetAllTimeAndPayrollData = useCallback((resetJobLaborCosts) => {
    console.log('=== RESETTING ALL TIME AND PAYROLL DATA ===');
    
    // Clear all local time and payroll data
    setTimeEntries([]);
    setPieceRateEntries([]);
    setPayrollEntries([]);
    
    // Clear progress tracking from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('_hang_progress') || key.includes('_coat_progress')) {
        localStorage.removeItem(key);
        console.log('Removed progress key:', key);
      }
    });
    
    // Clear all storage
    storage.save(STORAGE_KEYS.TIME_ENTRIES, [], 'timeEntries');
    storage.save(STORAGE_KEYS.PIECE_RATE_ENTRIES, [], 'pieceRateEntries');
    storage.save(STORAGE_KEYS.PAYROLL_ENTRIES, [], 'payrollEntries');
    
    // Reset job labor costs if callback provided
    if (resetJobLaborCosts && typeof resetJobLaborCosts === 'function') {
      resetJobLaborCosts();
    }
    
    toast({
      title: "Complete Data Reset! 🧹",
      description: "All time entries, payroll reports, job labor costs, and progress data have been completely cleared!"
    });
    
    console.log('=== END COMPLETE RESET ===');
  }, []);

  // Generate payroll for a specific period
  const generatePayroll = useCallback((startDate, endDate, callback) => {
    const payrollData = employees.filter(emp => emp.isActive).map(employee => {
      // Get time entries for the period
      const employeeTimeEntries = timeEntries.filter(entry => 
        entry.employeeId === employee.id &&
        entry.clockOutTime &&
        new Date(entry.clockInTime) >= new Date(startDate) &&
        new Date(entry.clockInTime) <= new Date(endDate)
      );

      // Get piece rate entries for the period
      const employeePieceRateEntries = pieceRateEntries.filter(entry => 
        entry.employeeId === employee.id &&
        entry.status === 'completed' &&
        new Date(entry.startTime) >= new Date(startDate) &&
        new Date(entry.startTime) <= new Date(endDate)
      );

      // Calculate regular hours and overtime
      const totalHours = employeeTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
      const regularHours = Math.min(totalHours, 40);
      const overtimeHours = Math.max(0, totalHours - 40);

      // Calculate piece rate earnings
      const pieceRateEarnings = employeePieceRateEntries.reduce((sum, entry) => sum + (entry.totalEarnings || 0), 0);

      // Calculate pay based on pay type
      let basePay = 0;
      if (employee.payType === 'salary') {
        basePay = employee.salaryAmount || 0;
      } else {
        basePay = (regularHours * employee.hourlyRate) + (overtimeHours * employee.hourlyRate * 1.5);
      }

      // Calculate days worked for per diem
      const daysWorked = new Set(employeeTimeEntries.map(entry => 
        new Date(entry.clockInTime).toDateString()
      )).size;

      const perDiemTotal = (employee.perDiem || 0) * daysWorked;
      const fuelAllowance = employee.fuelAllowance || 0;

      // Calculate tool deductions
      let toolDeductionsTotal = 0;
      const updatedToolDeductions = (employee.toolDeductions || []).map(tool => {
        if (tool.remainingBalance > 0) {
          const deduction = Math.min(tool.weeklyDeduction, tool.remainingBalance);
          toolDeductionsTotal += deduction;
          return {
            ...tool,
            remainingBalance: tool.remainingBalance - deduction
          };
        }
        return tool;
      });

      const childSupportDeduction = employee.childSupportDeduction || 0;
      const miscDeduction = employee.miscDeduction || 0;
      const miscDeductionNote = employee.miscDeductionNote || '';

      // Update employee with new tool deduction balances
      updateEmployeeToolDeductions(employee.id, updatedToolDeductions);

      const grossPay = basePay + pieceRateEarnings + perDiemTotal + fuelAllowance;
      const totalDeductions = toolDeductionsTotal + childSupportDeduction + miscDeduction;
      const netPay = grossPay - totalDeductions;

      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeType: employee.employeeType,
        payType: employee.payType,
        regularHours,
        overtimeHours,
        totalHours,
        hourlyRate: employee.hourlyRate,
        salaryAmount: employee.salaryAmount,
        basePay,
        pieceRateEarnings,
        perDiemDays: daysWorked,
        perDiemRate: employee.perDiem,
        perDiemTotal,
        fuelAllowance,
        toolDeductionsTotal,
        childSupportDeduction,
        miscDeduction,
        miscDeductionNote,
        grossPay,
        netPay,
        bankedHours: employee.bankedHours || 0,
        toolDeductions: updatedToolDeductions.filter(tool => tool.remainingBalance > 0)
      };
    });

    const newPayrollEntry = {
      id: generateId(),
      startDate,
      endDate,
      generatedDate: new Date().toISOString(),
      payrollData,
      status: 'draft',
      // Add editable fields
      perDiemTotal: payrollData.reduce((sum, emp) => sum + emp.perDiemTotal, 0),
      fuelAllowance: payrollData.reduce((sum, emp) => sum + emp.fuelAllowance, 0),
      toolDeductionsTotal: payrollData.reduce((sum, emp) => sum + emp.toolDeductionsTotal, 0),
      childSupportDeductionTotal: payrollData.reduce((sum, emp) => sum + emp.childSupportDeduction, 0),
      miscDeductionTotal: payrollData.reduce((sum, emp) => sum + emp.miscDeduction, 0)
    };

    setPayrollEntries(prev => [...prev, newPayrollEntry]);

    toast({
      title: "Payroll Generated! 💰",
      description: `Payroll for ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()} has been generated.`
    });

    if (callback) callback(newPayrollEntry);
  }, [employees, timeEntries, pieceRateEntries, updateEmployeeToolDeductions]);

  // Update an existing payroll entry
  const updatePayrollEntry = useCallback((payrollId, updates, callback) => {
    console.log("Updating payroll entry:", payrollId, updates);
    
    setPayrollEntries(prev => {
      const updatedEntries = prev.map(entry => 
        entry.id === payrollId 
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      );
      
      return updatedEntries;
    });
    
    toast({
      title: "Payroll Updated! ✨",
      description: "Payroll report has been updated successfully."
    });
    
    if (callback) callback();
  }, []);

  const clockIn = useCallback((employeeId, jobId, additionalData = {}, callback) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive"
      });
      return;
    }

    const activeEntry = timeEntries.find(entry => 
      entry.employeeId === employeeId && !entry.clockOutTime
    );

    if (activeEntry) {
      toast({
        title: "Already Clocked In",
        description: `${employee.firstName} is already clocked in.`,
        variant: "destructive"
      });
      return;
    }

    // Check if employee already has any entries (hourly or piece rate) for this job on the same day
    const today = new Date().toDateString();
    const existingTimeEntryToday = timeEntries.find(entry => 
      entry.employeeId === employeeId && 
      entry.jobId === jobId && 
      new Date(entry.clockInTime).toDateString() === today
    );

    const existingPieceRateEntryToday = pieceRateEntries.find(entry => 
      entry.employeeId === employeeId && 
      entry.jobId === jobId && 
      new Date(entry.startTime).toDateString() === today
    );

    if (existingTimeEntryToday || existingPieceRateEntryToday) {
      toast({
        title: "Already Worked Today",
        description: `${employee.firstName} has already worked on this job today. Employees can only work one type (hourly OR piece rate) per job per day.`,
        variant: "destructive"
      });
      return;
    }

    const newTimeEntry = {
      id: generateId(),
      employeeId,
      jobId,
      clockInTime: new Date().toISOString(),
      clockOutTime: null,
      totalHours: 0,
      notes: '',
      entryType: 'hourly',
      trade: additionalData.trade || null,
      phase: additionalData.phase || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating new time entry:', newTimeEntry);
    setTimeEntries(prev => [...prev, newTimeEntry]);
    toast({
      title: "Clocked In! ⏰",
      description: `${employee.firstName} ${employee.lastName} has clocked in successfully.`
    });
    if (callback) callback();
  }, [employees, timeEntries]);

  const clockOut = useCallback(async (employeeId, notes = '', callback) => {
    console.log('=== CLOCK OUT FUNCTION CALLED ===');
    console.log('employeeId:', employeeId);
    console.log('notes:', notes);
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      console.log('Employee not found');
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive"
      });
      return;
    }

    // Check for active hourly time entry
    const activeTimeEntry = timeEntries.find(entry => 
      entry.employeeId === employeeId && !entry.clockOutTime
    );

    // Check for active piece rate entry
    const activePieceRateEntry = pieceRateEntries.find(entry => 
      entry.employeeId === employeeId && entry.status === 'active'
    );

    console.log('Active time entry:', activeTimeEntry);
    console.log('Active piece rate entry:', activePieceRateEntry);

    if (!activeTimeEntry && !activePieceRateEntry) {
      console.log('No active entries found');
      toast({
        title: "Not Clocked In",
        description: `${employee.firstName} is not currently clocked in for any work.`,
        variant: "destructive"
      });
      return;
    }

    // Handle hourly time entry clock out
    if (activeTimeEntry) {
      console.log('=== HANDLING HOURLY CLOCK OUT ===');
      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(activeTimeEntry.clockInTime);
      const clockOutTimeDate = new Date(clockOutTime);
      const totalHours = (clockOutTimeDate - clockInTime) / (1000 * 60 * 60);

      console.log('Clocking out hourly entry:', activeTimeEntry.id, 'Total hours:', totalHours);
      
      setTimeEntries(prev => prev.map(entry =>
        entry.id === activeTimeEntry.id
          ? {
              ...entry,
              clockOutTime,
              totalHours: Math.round(totalHours * 100) / 100,
              notes,
              updatedAt: new Date().toISOString()
            }
          : entry
      ));

      toast({
        title: "Clocked Out! 🏁",
        description: `${employee.firstName} ${employee.lastName} has clocked out. Total time: ${Math.round(totalHours * 100) / 100} hours.`
      });
    }

    // Handle piece rate entry clock out
    if (activePieceRateEntry) {
      console.log('Clocking out piece rate entry:', activePieceRateEntry.id);
      
      setPieceRateEntries(prev => prev.map(entry =>
        entry.id === activePieceRateEntry.id
          ? {
              ...entry,
              endTime: new Date().toISOString(),
              status: 'cancelled',
              notes: notes || 'Clock out without completion',
              updatedAt: new Date().toISOString()
            }
          : entry
      ));

      const workTypeDisplay = employee.role === 'Hanger' ? 'hanging' : `${activePieceRateEntry.coat.charAt(0).toUpperCase() + activePieceRateEntry.coat.slice(1)} coat`;
      toast({
        title: "Piece Rate Work Cancelled! ⏹️",
        description: `${employee.firstName} ${employee.lastName} has stopped ${workTypeDisplay} piece rate work.`
      });
    }

    if (callback) callback();
  }, [employees, timeEntries, pieceRateEntries]);

  // Get total completion percentage for a job/employee/coat combination
  const getJobCoatProgress = useCallback((jobId, employeeId, coat) => {
    const completedEntries = pieceRateEntries.filter(entry => 
      entry.jobId === jobId && 
      entry.employeeId === employeeId && 
      entry.coat === coat && 
      entry.status === 'completed'
    );
    
    return completedEntries.reduce((total, entry) => total + (entry.completionPercentage || 0), 0);
  }, [pieceRateEntries]);

  // Get total completion percentage for hanging (cumulative across all entries)
  const getJobHangProgress = useCallback((jobId, employeeId) => {
    const completedEntries = pieceRateEntries.filter(entry => 
      entry.jobId === jobId && 
      entry.employeeId === employeeId && 
      (entry.coat === 'hang' || entry.coat === 'hanging') && 
      entry.status === 'completed'
    );
    
    return Math.max(0, ...completedEntries.map(entry => entry.completionPercentage || 0));
  }, [pieceRateEntries]);

  // Check if a coat is available for selection
  const isCoatAvailable = useCallback((jobId, employeeId, coat) => {
    const totalProgress = getJobCoatProgress(jobId, employeeId, coat);
    return totalProgress < 100;
  }, [getJobCoatProgress]);

  // Determine available coats based on job's finish scope
  const getAvailableCoats = useCallback((jobId, employeeId, jobs = []) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      console.log('Job not found for coat determination');
      return [];
    }

    const finishScope = (job.scopes || []).find(scope => 
      scope.name.toLowerCase().includes('finish')
    );

    if (!finishScope) {
      console.log('No finish scope found, using default coats');
      const defaultCoats = ['tape', 'bed', 'skim', 'sand'];
      return defaultCoats.filter(coat => isCoatAvailable(jobId, employeeId, coat));
    }

    const ceilingFinish = finishScope.ceilingFinish || '';
    const wallFinish = finishScope.wallFinish || '';
    
    console.log('Determining coats for:', { ceilingFinish, wallFinish });

    let availableCoats = [];

    if (ceilingFinish.includes('Level 5') || wallFinish.includes('Level 5')) {
      availableCoats = ['tape', 'bed', 'skim', 'level5', 'sand'];
    } else if (ceilingFinish.includes('Stomp') || ceilingFinish.includes('Knockdown') || 
               ceilingFinish.includes('Splatter') || ceilingFinish.includes('Texture')) {
      availableCoats = ['tape', 'bed', 'skim', 'texture', 'sand'];
    } else {
      availableCoats = ['tape', 'bed', 'skim', 'sand'];
    }

    console.log('Available coat sequence:', availableCoats);
    return availableCoats.filter(coat => isCoatAvailable(jobId, employeeId, coat));
  }, [isCoatAvailable]);

  // Get remaining percentage for a coat
  const getRemainingCoatPercentage = useCallback((jobId, employeeId, coat) => {
    const totalProgress = getJobCoatProgress(jobId, employeeId, coat);
    return Math.max(0, 100 - totalProgress);
  }, [getJobCoatProgress]);

  const punchInPieceRate = useCallback((employeeId, jobId, coat, additionalData = {}, callback) => {
    console.log('=== PUNCH IN PIECE RATE CALLED ===');
    console.log('employeeId:', employeeId);
    console.log('jobId:', jobId);
    console.log('coat:', coat);
    console.log('callback:', !!callback);
    
    const employee = employees.find(emp => emp.id === employeeId);
    console.log('Found employee:', employee);
    
    console.log('=== STARTING VALIDATION CHECKS ===');
    
    if (!employee) {
      console.log('=== EARLY RETURN: Employee not found ===');
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('=== EMPLOYEE FOUND, CHECKING ROLE ===');

    if (employee.role === 'Laborer') {
      console.log('=== EARLY RETURN: Laborer not allowed ===');
      toast({
        title: "Not Allowed",
        description: "Laborers can only work hourly, not piece rate.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('=== ROLE CHECK PASSED, CHECKING ACTIVE ENTRIES ===');

    const activeTimeEntry = timeEntries.find(entry => 
      entry.employeeId === employeeId && !entry.clockOutTime
    );

    const activePieceRateEntry = pieceRateEntries.find(entry => 
      entry.employeeId === employeeId && entry.status === 'active'
    );

    console.log('=== CHECKING ACTIVE ENTRIES ===');
    console.log('activeTimeEntry:', activeTimeEntry);
    console.log('activePieceRateEntry:', activePieceRateEntry);

    if (activeTimeEntry || activePieceRateEntry) {
      console.log('=== EARLY RETURN: Already working ===');
      console.log('activeTimeEntry:', activeTimeEntry);
      console.log('activePieceRateEntry:', activePieceRateEntry);
      toast({
        title: "Already Working",
        description: `${employee.firstName} is already working on a job.`,
        variant: "destructive"
      });
      return;
    }
    
    console.log('=== ACTIVE ENTRIES CHECK PASSED ===');

    // Check if employee already has any entries (hourly or piece rate) for this job on the same day
    const today = new Date().toDateString();
    const existingTimeEntryToday = timeEntries.find(entry => 
      entry.employeeId === employeeId && 
      entry.jobId === jobId && 
      new Date(entry.clockInTime).toDateString() === today
    );

    // For piece rate, check if they already worked on THIS SPECIFIC COAT today
    const existingPieceRateEntryToday = pieceRateEntries.find(entry => 
      entry.employeeId === employeeId && 
      entry.jobId === jobId && 
      entry.coat === coat && 
      new Date(entry.startTime).toDateString() === today
    );

    console.log('=== CHECKING ALREADY WORKED TODAY ===');
    console.log('today:', today);
    console.log('existingTimeEntryToday:', existingTimeEntryToday);
    console.log('existingPieceRateEntryToday (same coat):', existingPieceRateEntryToday);

    if (existingTimeEntryToday || existingPieceRateEntryToday) {
      console.log('=== EARLY RETURN: Already worked today ===');
      console.log('existingTimeEntryToday:', existingTimeEntryToday);
      console.log('existingPieceRateEntryToday:', existingPieceRateEntryToday);
      toast({
        title: "Already Worked Today",
        description: existingTimeEntryToday 
          ? `${employee.firstName} has already worked hourly on this job today.`
          : `${employee.firstName} has already worked on the ${coat} coat for this job today.`,
        variant: "destructive"
      });
      return;
    }
    
    console.log('=== ALREADY WORKED TODAY CHECK PASSED ===');

    if (employee.role === 'Finisher') {
      console.log('=== CHECKING COAT AVAILABILITY ===');
      console.log('jobId:', jobId);
      console.log('employeeId:', employeeId);
      console.log('coat:', coat);
      const isAvailable = isCoatAvailable(jobId, employeeId, coat);
      console.log('isCoatAvailable result:', isAvailable);
      
      if (!isAvailable) {
        console.log('=== EARLY RETURN: Coat already complete ===');
        console.log('jobId:', jobId);
        console.log('employeeId:', employeeId);
        console.log('coat:', coat);
        toast({
          title: "Coat Already Complete",
          description: `The ${coat} coat is already 100% complete for this job.`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('=== COAT AVAILABILITY CHECK PASSED ===');
    }

    if (employee.role === 'Hanger') {
      const currentProgress = getJobHangProgress(jobId, employeeId);
      if (currentProgress >= 100) {
        console.log('=== EARLY RETURN: Job already complete for hanging ===');
        console.log('currentProgress:', currentProgress);
        toast({
          title: "Job Already Complete",
          description: "This job is already 100% complete for hanging.",
          variant: "destructive"
        });
        return;
      }
    }

    console.log('=== ABOUT TO CREATE PIECE RATE ENTRY ===');
    console.log('All validation passed, creating entry...');
    
    const newPieceRateEntry = {
      id: generateId(),
      employeeId,
      jobId,
      role: employee.role,
      coat,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      completionPercentage: 0,
      pieceRate: 0,
      totalEarnings: 0,
      apprenticeId: null,
      apprenticeHours: 0,
      apprenticeCost: 0,
      notes: '',
      trade: additionalData.trade || null,
      phase: additionalData.phase || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating new piece rate entry:', newPieceRateEntry);
    console.log('Previous pieceRateEntries length:', pieceRateEntries.length);
    console.log('Previous pieceRateEntries:', pieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, status: e.status })));
    
    setPieceRateEntries(prev => {
      const newEntries = [...prev, newPieceRateEntry];
      console.log('=== PIECE RATE ENTRY CREATED ===');
      console.log('New pieceRateEntries length:', newEntries.length);
      console.log('New pieceRateEntries:', newEntries.map(e => ({ id: e.id, employeeId: e.employeeId, status: e.status })));
      console.log('Entry details:', newPieceRateEntry);
      console.log('All entries after creation:', newEntries);
      
      // Call callback after state is updated
      setTimeout(() => {
        if (callback) {
          console.log('=== CALLING CALLBACK AFTER STATE UPDATE ===');
          callback();
        }
      }, 0);
      
      return newEntries;
    });
    
    // Debug: Check if the entry was created correctly
    setTimeout(() => {
      console.log('=== DEBUG: CHECKING ENTRY AFTER CREATION ===');
      console.log('Current pieceRateEntries:', pieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, status: e.status, endTime: e.endTime })));
    }, 100);
    
    const workTypeDisplay = employee.role === 'Hanger' ? 'hanging' : `${coat} coat`;
    toast({
      title: "Punched In for Piece Rate! 📐",
      description: `${employee.firstName} ${employee.lastName} is now working ${workTypeDisplay} piece rate.`
    });
  }, [employees, timeEntries, pieceRateEntries, isCoatAvailable, getJobHangProgress]);

  const completePieceRateEntry = useCallback((entryId, completionPercentage, pieceRatePerSqft, calculatedNetEarnings, notes = '', apprenticeId = null, apprenticeHours = 0, apprenticeCost = 0, callback) => {
    console.log('=== completePieceRateEntry CALLED ===');
    console.log('entryId:', entryId);
    console.log('completionPercentage:', completionPercentage);
    console.log('pieceRatePerSqft:', pieceRatePerSqft);
    console.log('calculatedNetEarnings:', calculatedNetEarnings);
    console.log('notes:', notes);
    console.log('apprenticeId:', apprenticeId);
    console.log('apprenticeHours:', apprenticeHours);
    console.log('apprenticeCost:', apprenticeCost);
    console.log('callback:', !!callback);
    
    const entry = pieceRateEntries.find(e => e.id === entryId);
    if (!entry) {
      console.log('Entry not found for ID:', entryId);
      toast({
        title: "Error",
        description: "Piece rate entry not found.",
        variant: "destructive"
      });
      return;
    }

    const employee = employees.find(emp => emp.id === entry.employeeId);
    const completionPercent = parseFloat(completionPercentage);

    console.log('=== COMPLETING PIECE RATE ENTRY ===');
    console.log('Entry ID:', entryId);
    console.log('Completion %:', completionPercent);
    console.log('Employee Role:', employee?.role);
    console.log('Coat:', entry.coat);

    if (employee?.role === 'Hanger') {
      const currentProgress = getJobHangProgress(entry.jobId, entry.employeeId);
      console.log('Current hang progress:', currentProgress);
      
      if (completionPercent > 100) {
        toast({
          title: "Invalid Completion Percentage",
          description: "Completion percentage cannot exceed 100%.",
          variant: "destructive"
        });
        return;
      }
      
      if (completionPercent <= currentProgress) {
        toast({
          title: "Invalid Completion Percentage",
          description: `Completion percentage must be greater than current progress (${currentProgress}%).`,
          variant: "destructive"
        });
        return;
      }
    }

    if (employee?.role === 'Finisher') {
      const currentCoatProgress = getJobCoatProgress(entry.jobId, entry.employeeId, entry.coat);
      const remainingPercentage = 100 - currentCoatProgress;
      
      console.log('Current coat progress:', currentCoatProgress);
      console.log('Remaining percentage:', remainingPercentage);
      
      if (completionPercent > remainingPercentage) {
        toast({
          title: "Invalid Completion Percentage",
          description: `Only ${remainingPercentage}% remaining for this coat. Cannot exceed 100% total.`,
          variant: "destructive"
        });
        return;
      }
      
      if (completionPercent <= 0) {
        toast({
          title: "Invalid Completion Percentage",
          description: "Completion percentage must be greater than 0%.",
          variant: "destructive"
        });
        return;
      }
    }

    console.log('Validation passed, completing entry...');

    const updatedEntry = {
      ...entry,
      endTime: new Date().toISOString(),
      status: 'completed',
      completionPercentage: completionPercent,
      pieceRate: parseFloat(pieceRatePerSqft),
      totalEarnings: Math.round(calculatedNetEarnings * 100) / 100,
      apprenticeId: apprenticeId || null,
      apprenticeHours: parseFloat(apprenticeHours) || 0,
      apprenticeCost: parseFloat(apprenticeCost) || 0,
      notes,
      updatedAt: new Date().toISOString()
    };

    console.log('Updated entry:', updatedEntry);

    setPieceRateEntries(prev => {
      const newEntries = prev.map(e => e.id === entryId ? updatedEntry : e);
      console.log('New piece rate entries array:', newEntries.length);
      
      return newEntries;
    });

    const workTypeDisplay = employee?.role === 'Hanger' ? 'hanging' : `${entry.coat} coat`;

    // Create time entry for assistant if one was used
    if (apprenticeId && apprenticeId !== 'none' && apprenticeHours > 0) {
      const assistant = employees.find(emp => emp.id === apprenticeId);
      if (assistant) {
        const assistantTimeEntry = {
          id: generateId(),
          employeeId: apprenticeId,
          jobId: entry.jobId,
          clockInTime: entry.startTime, // Assistant started when piece rate work started
          clockOutTime: new Date().toISOString(), // Assistant finished when piece rate work completed
          totalHours: parseFloat(apprenticeHours),
          notes: `Assisted ${employee.firstName} ${employee.lastName} with ${workTypeDisplay} piece rate work`,
          entryType: 'hourly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log('Creating assistant time entry:', assistantTimeEntry);
        setTimeEntries(prev => [...prev, assistantTimeEntry]);

        toast({
          title: "Assistant Time Entry Created! 👥",
          description: `${assistant.firstName} ${assistant.lastName} time entry created for ${apprenticeHours} hours.`
        });

        // Force labor cost recalculation after creating assistant time entry
        setTimeout(() => {
          console.log('Triggering labor cost recalculation after assistant time entry creation');
          // This will trigger the useEffect in useJobs that watches timeEntries
        }, 100);
      }
    }
    const progressDisplay = employee?.role === 'Hanger' ? 
      `${completionPercent}% total` : 
      `${completionPercent}% of ${workTypeDisplay}`;
    
    toast({
      title: "Piece Rate Entry Completed! 💰",
      description: `${employee?.firstName} completed ${progressDisplay}. Net earnings: $${Math.round(calculatedNetEarnings * 100) / 100}.`
    });
    
    console.log('=== END COMPLETING PIECE RATE ENTRY ===');
    if (callback) callback();
  }, [pieceRateEntries, employees, getJobHangProgress, getJobCoatProgress]);

  const updateTimeEntry = useCallback((entryId, updates, callback) => {
    setTimeEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const updatedEntry = { ...entry, ...updates, updatedAt: new Date().toISOString() };
        
        if (updates.clockInTime || updates.clockOutTime) {
          const clockInTime = new Date(updatedEntry.clockInTime);
          const clockOutTime = updatedEntry.clockOutTime ? new Date(updatedEntry.clockOutTime) : null;
          
          if (clockOutTime) {
            const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
            updatedEntry.totalHours = Math.round(totalHours * 100) / 100;
          }
        }
        
        return updatedEntry;
      }
      return entry;
    }));
    
    toast({
      title: "Time Entry Updated! ✅",
      description: "Time entry has been updated successfully."
    });
    if (callback) callback();
  }, []);

  const updatePieceRateEntry = useCallback((entryId, updates, callback) => {
    setPieceRateEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const updatedEntry = { ...entry, ...updates, updatedAt: new Date().toISOString() };
        return updatedEntry;
      }
      return entry;
    }));
    
    toast({
      title: "Piece Rate Entry Updated! ✅",
      description: "Piece rate entry has been updated successfully."
    });
    if (callback) callback();
  }, []);

  const deleteTimeEntry = useCallback((entryId, callback) => {
    console.log('=== DELETING TIME ENTRY ===');
    console.log('Deleting entry ID:', entryId);
    console.log('Current time entries before deletion:', timeEntries.length);
    
    setTimeEntries(prev => {
      const filtered = prev.filter(entry => entry.id !== entryId);
      console.log('Time entries after deletion:', filtered.length);
      
      // Save to localStorage immediately
      storage.save(STORAGE_KEYS.TIME_ENTRIES, filtered, 'timeEntries');
      console.log('Saved to localStorage:', filtered.length, 'entries');
      
      return filtered;
    });
    
    toast({
      title: "Time Entry Deleted! 🗑️",
      description: "The time entry has been removed.",
      variant: "destructive"
    });
    if (callback) callback(entryId);
  }, [timeEntries]);

  const deletePieceRateEntry = useCallback((entryId, callback) => {
    console.log('=== DELETING PIECE RATE ENTRY ===');
    console.log('Deleting entry ID:', entryId);
    console.log('Current piece rate entries before deletion:', pieceRateEntries.length);
    
    setPieceRateEntries(prev => {
      const filtered = prev.filter(entry => entry.id !== entryId);
      console.log('Piece rate entries after deletion:', filtered.length);
      
      // Save to localStorage immediately
      storage.save(STORAGE_KEYS.PIECE_RATE_ENTRIES, filtered, 'pieceRateEntries');
      console.log('Saved to localStorage:', filtered.length, 'entries');
      
      return filtered;
    });
    
    toast({
      title: "Piece Rate Entry Deleted! 🗑️",
      description: "The piece rate entry has been removed.",
      variant: "destructive"
    });
    if (callback) callback(entryId);
  }, [pieceRateEntries]);

  const getEmployeeActiveEntry = useCallback((employeeId) => {
    return timeEntries.find(entry => 
      entry.employeeId === employeeId && !entry.clockOutTime
    );
  }, [timeEntries]);

  const getEmployeeActivePieceRateEntry = useCallback((employeeId) => {
    return pieceRateEntries.find(entry => 
      entry.employeeId === employeeId && entry.status === 'active'
    );
  }, [pieceRateEntries]);

  const getJobPieceRateProgress = useCallback((jobId, employeeId, coat) => {
    if (coat === 'hang') {
      return getJobHangProgress(jobId, employeeId);
    } else {
      return getJobCoatProgress(jobId, employeeId, coat);
    }
  }, [getJobHangProgress, getJobCoatProgress]);

  const getEmployeeTimeEntries = useCallback((employeeId, startDate = null, endDate = null) => {
    let entries = timeEntries.filter(entry => entry.employeeId === employeeId);
    
    if (startDate) {
      entries = entries.filter(entry => 
        new Date(entry.clockInTime) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      entries = entries.filter(entry => 
        new Date(entry.clockInTime) <= new Date(endDate)
      );
    }
    
    return entries.sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime));
  }, [timeEntries]);

  const getEmployeePieceRateEntries = useCallback((employeeId, startDate = null, endDate = null) => {
    let entries = pieceRateEntries.filter(entry => entry.employeeId === employeeId);
    
    if (startDate) {
      entries = entries.filter(entry => 
        new Date(entry.startTime) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      entries = entries.filter(entry => 
        new Date(entry.startTime) <= new Date(endDate)
      );
    }
    
    return entries.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [pieceRateEntries]);

  const getJobTimeEntries = useCallback((jobId, startDate = null, endDate = null) => {
    let entries = timeEntries.filter(entry => entry.jobId === jobId);
    
    if (startDate) {
      entries = entries.filter(entry => 
        new Date(entry.clockInTime) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      entries = entries.filter(entry => 
        new Date(entry.clockInTime) <= new Date(endDate)
      );
    }
    
    return entries.sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime));
  }, [timeEntries]);

  const getTotalHoursForEmployee = useCallback((employeeId, startDate = null, endDate = null) => {
    const entries = getEmployeeTimeEntries(employeeId, startDate, endDate);
    return entries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
  }, [getEmployeeTimeEntries]);

  const getTotalEarningsForEmployee = useCallback((employeeId, startDate = null, endDate = null) => {
    const entries = getEmployeePieceRateEntries(employeeId, startDate, endDate);
    return entries.reduce((total, entry) => total + (entry.totalEarnings || 0), 0);
  }, [getEmployeePieceRateEntries]);

  const getTotalHoursForJob = useCallback((jobId, startDate = null, endDate = null) => {
    const entries = getJobTimeEntries(jobId, startDate, endDate);
    return entries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
  }, [getJobTimeEntries]);

  return {
    timeEntries,
    employees,
    pieceRateEntries,
    payrollEntries,
    loading,
    clockIn,
    clockOut,
    punchInPieceRate,
    completePieceRateEntry,
    updateTimeEntry,
    updatePieceRateEntry,
    deleteTimeEntry,
    deletePieceRateEntry,
    getEmployeeActiveEntry,
    getEmployeeActivePieceRateEntry,
    getJobPieceRateProgress,
    getEmployeeTimeEntries,
    getEmployeePieceRateEntries,
    getJobTimeEntries,
    getTotalHoursForEmployee,
    getTotalEarningsForEmployee,
    getTotalHoursForJob,
    clearAllTimeEntries,
    resetAllTimeAndPayrollData,
    getJobCoatProgress,
    getJobHangProgress,
    isCoatAvailable,
    getAvailableCoats,
    getRemainingCoatPercentage,
    generatePayroll,
    updatePayrollEntry,
  };
}
