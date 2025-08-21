import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useJobs } from '@/hooks/useJobs';
import ClockInOutControls from './ClockInOutControls';
import PieceRateCompletion from './PieceRateCompletion';
import EmployeeStatus from './EmployeeStatus';

const ClockInOut = ({ 
  employees, 
  timeEntries, 
  pieceRateEntries,
  clockIn,
  clockOut,
  punchInPieceRate,
  getAvailableCoats,
  getRemainingCoatPercentage,
  getJobPieceRateProgress,
  completePieceRateEntry,
  getEmployeeActivePieceRateEntry
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [workType, setWorkType] = useState('hourly');
  const [showPieceRateModal, setShowPieceRateModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when data changes
  const dataKey = `${timeEntries.length}-${pieceRateEntries.length}-${forceUpdate}`;

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('=== STATE CHANGE DEBUG ===');
    console.log('timeEntries length:', timeEntries.length);
    console.log('pieceRateEntries length:', pieceRateEntries.length);
    console.log('pieceRateEntries details:', pieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, status: e.status, startTime: e.startTime })));
    console.log('selectedEmployee:', selectedEmployee);
    console.log('selectedJob:', selectedJob);
    console.log('workType:', workType);
    
    // Test: Check if pieceRateEntries is actually an array
    console.log('pieceRateEntries type:', typeof pieceRateEntries);
    console.log('pieceRateEntries is array:', Array.isArray(pieceRateEntries));
    console.log('pieceRateEntries raw:', pieceRateEntries);
  }, [timeEntries, pieceRateEntries, selectedEmployee, selectedJob, workType]);

  // Force re-render when data changes
  useEffect(() => {
    console.log('=== FORCE RE-RENDER TRIGGERED ===');
    console.log('Data key changed:', dataKey);
  }, [dataKey]);
  const { jobs } = useJobs();

  const activeEmployees = employees.filter(emp => emp.isActive);
  const activeJobs = jobs.filter(job => job.status === 'active');

  // Memoize derived state
  const selectedEmployeeData = useMemo(() => {
    return employees.find(emp => emp.id === selectedEmployee) || null;
  }, [employees, selectedEmployee]);

  const activeEntry = useMemo(() => {
    if (!selectedEmployeeData || !selectedEmployee) return null;
    const entry = timeEntries.find(entry => 
      entry.employeeId === selectedEmployee && !entry.clockOutTime
    );
    console.log('activeEntry calculation:', {
      selectedEmployee,
      timeEntriesLength: timeEntries.length,
      foundEntry: entry
    });
    return entry;
  }, [selectedEmployeeData, selectedEmployee, timeEntries, timeEntries.length, forceUpdate]);

  const activePieceRateEntry = useMemo(() => {
    if (!selectedEmployeeData || !selectedEmployee) return null;
    
    console.log('=== ACTIVE PIECE RATE ENTRY SEARCH ===');
    console.log('Searching for employee:', selectedEmployee);
    console.log('Total piece rate entries:', pieceRateEntries.length);
    console.log('All piece rate entries:', pieceRateEntries);
    
    // Manual test: Try to find ANY entry for this employee
    const anyEntryForEmployee = pieceRateEntries.find(entry => entry.employeeId === selectedEmployee);
    console.log('Any entry for employee:', anyEntryForEmployee);
    
    // Manual test: Try to find ANY active entry
    const anyActiveEntry = pieceRateEntries.find(entry => entry.status === 'active');
    console.log('Any active entry:', anyActiveEntry);
    
    const entry = pieceRateEntries.find(entry => 
      entry.employeeId === selectedEmployee && entry.status === 'active'
    );
    
    console.log('activePieceRateEntry calculation:', { 
      selectedEmployee, 
      selectedEmployeeData: !!selectedEmployeeData, 
      pieceRateEntriesLength: pieceRateEntries.length,
      foundEntry: entry,
      allPieceRateEntries: pieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, status: e.status, startTime: e.startTime }))
    });
    console.log('=== DETAILED PIECE RATE ENTRIES ===');
    pieceRateEntries.forEach((entry, index) => {
      console.log(`Entry ${index}:`, {
        id: entry.id,
        employeeId: entry.employeeId,
        status: entry.status,
        startTime: entry.startTime,
        endTime: entry.endTime
      });
    });
    
    if (!entry) {
      console.log('=== NO ACTIVE PIECE RATE ENTRY FOUND ===');
      console.log('This means either:');
      console.log('1. No piece rate entry exists for this employee');
      console.log('2. The piece rate entry status is not "active"');
      console.log('3. The employeeId does not match');
    } else {
      console.log('=== ACTIVE PIECE RATE ENTRY FOUND ===');
      console.log('Entry details:', entry);
    }
    
    return entry;
  }, [selectedEmployeeData, selectedEmployee, pieceRateEntries, pieceRateEntries.length, forceUpdate]);

  const isCurrentlyWorking = !!(activeEntry || activePieceRateEntry);
  
  // Debug logging for working status
  console.log('=== WORKING STATUS CALCULATION ===');
  console.log('activeEntry:', activeEntry);
  console.log('activePieceRateEntry:', activePieceRateEntry);
  console.log('isCurrentlyWorking:', isCurrentlyWorking);

  // Debug logging for state changes
  useEffect(() => {
    console.log('=== WORKING STATUS DEBUG ===');
    console.log('selectedEmployee:', selectedEmployee);
    console.log('activeEntry:', activeEntry);
    console.log('activePieceRateEntry:', activePieceRateEntry);
    console.log('isCurrentlyWorking:', isCurrentlyWorking);
    console.log('timeEntries length:', timeEntries.length);
    console.log('pieceRateEntries length:', pieceRateEntries.length);
  }, [selectedEmployee, activeEntry, activePieceRateEntry, isCurrentlyWorking, timeEntries.length, pieceRateEntries.length]);

  // Debug effect to monitor modal state
  useEffect(() => {
    console.log('Modal state debug:', {
      showPieceRateModal,
      hasActivePieceRateEntry: !!activePieceRateEntry,
      selectedEmployee,
      selectedJob,
      isCurrentlyWorking
    });
  }, [showPieceRateModal, activePieceRateEntry, selectedEmployee, selectedJob, isCurrentlyWorking]);

  // Handle state changes
  const handleStateChange = useCallback((action) => {
    console.log('handleStateChange called with action:', action);
    
    if (action === 'showPieceRateCompletion') {
      console.log('Setting showPieceRateModal to true');
      setShowPieceRateModal(true);
    } else if (action === 'refresh') {
      console.log('Forcing UI refresh');
      // Force a re-render by updating a state variable
      setShowPieceRateModal(prev => prev);
      
      // Force update to trigger re-render
      setForceUpdate(prev => prev + 1);
      
      // Additional force refresh mechanism
      setTimeout(() => {
        console.log('Additional force refresh triggered');
        setShowPieceRateModal(prev => prev);
        setForceUpdate(prev => prev + 1);
      }, 50);
      
      // More aggressive refresh mechanism
      setTimeout(() => {
        console.log('Second force refresh triggered');
        setShowPieceRateModal(prev => prev);
        setForceUpdate(prev => prev + 1);
      }, 100);
    }
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Time Clock</CardTitle>
                  <p className="text-white/80 mt-1">Employee Time Tracking & Management</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Active Employees</p>
                <p className="font-semibold text-2xl">{activeEmployees.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Active Jobs</p>
                <p className="font-semibold text-2xl">{activeJobs.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Currently Working</p>
                <p className="font-semibold text-2xl">
                  {employees.filter(emp => {
                    const timeEntry = timeEntries.find(entry => 
                      entry.employeeId === emp.id && !entry.clockOutTime
                    );
                    const pieceEntry = pieceRateEntries.find(entry => 
                      entry.employeeId === emp.id && entry.status === 'active'
                    );
                    return timeEntry || pieceEntry;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-brandPrimary" />
              Employee Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} - {employee.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployeeData && (
              <EmployeeStatus 
                employee={selectedEmployeeData}
                activeEntry={activeEntry}
                activePieceRateEntry={activePieceRateEntry}
                isCurrentlyWorking={isCurrentlyWorking}
              />
            )}
          </CardContent>
        </Card>

        {/* Job Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-brandSecondary" />
              Job Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Job</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job" />
                </SelectTrigger>
                <SelectContent>
                  {activeJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.jobName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Work Type</label>
              <Select value={workType} onValueChange={setWorkType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="piece-rate">Piece Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clock In/Out Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Time Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClockInOutControls
              key={`${selectedEmployee}-${isCurrentlyWorking}-${activeEntry?.id || 'none'}-${activePieceRateEntry?.id || 'none'}`}
              selectedEmployee={selectedEmployee}
              selectedJob={selectedJob}
              workType={workType}
              isCurrentlyWorking={isCurrentlyWorking}
              activeEntry={activeEntry}
              activePieceRateEntry={activePieceRateEntry}
              employees={employees}
              jobs={jobs}
              onStateChange={handleStateChange}
              clockIn={clockIn}
              clockOut={clockOut}
              punchInPieceRate={punchInPieceRate}
              getAvailableCoats={getAvailableCoats}
            />
          </CardContent>
        </Card>
      </div>

      {/* Piece Rate Completion Modal */}
      {console.log('Modal render check:', { showPieceRateModal, hasActivePieceRateEntry: !!activePieceRateEntry, selectedEmployee, selectedJob })}
      {showPieceRateModal && activePieceRateEntry && selectedEmployee && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Complete Piece Rate Work</h2>
              <button
                onClick={() => setShowPieceRateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PieceRateCompletion
              selectedEmployee={selectedEmployee}
              selectedJob={selectedJob}
              employees={employees}
              onStateChange={() => {
                setShowPieceRateModal(false);
                // UI will update automatically since we're directly reactive to data changes
              }}
              getAvailableCoats={getAvailableCoats}
              getRemainingCoatPercentage={getRemainingCoatPercentage}
              getJobPieceRateProgress={getJobPieceRateProgress}
              completePieceRateEntry={completePieceRateEntry}
              getEmployeeActivePieceRateEntry={getEmployeeActivePieceRateEntry}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockInOut;
