import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Play, Square, Calendar, BarChart3, User, Briefcase, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTimeClock } from '@/hooks/useTimeClock';
import { useJobs } from '@/hooks/useJobs';
import ClockInOut from '@/components/clock-in-out/ClockInOut';
import TimeReports from '@/components/TimeReports';
import SafetyIncidentModal from '@/components/SafetyIncidentModal';

const TimeClock = ({ employees }) => {
  const [currentView, setCurrentView] = useState('clock');
  const [showSafetyIncidentModal, setShowSafetyIncidentModal] = useState(false);
  const { 
    timeEntries, 
    pieceRateEntries, 
    loading, 
    resetAllTimeAndPayrollData,
    clearAllTimeEntries,
    clockIn,
    clockOut,
    punchInPieceRate,
    getAvailableCoats,
    getRemainingCoatPercentage,
    getJobPieceRateProgress,
    completePieceRateEntry,
    getEmployeeActivePieceRateEntry
  } = useTimeClock();
  const { jobs, resetAllJobLaborCosts, deleteFutureTimeEntries } = useJobs();

  console.log('TimeClock component rendering with employees:', employees);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
        <p className="text-gray-600 font-medium">Loading time clock...</p>
      </div>
    );
  }

  const activeEmployees = employees.filter(emp => emp.isActive);
  const currentlyWorking = timeEntries.filter(entry => !entry.clockOutTime).length;
  const totalTimeEntries = timeEntries.length + pieceRateEntries.length;
  
  console.log('TimeClock - timeEntries length:', timeEntries.length);
  console.log('TimeClock - pieceRateEntries length:', pieceRateEntries.length);
  console.log('TimeClock - totalTimeEntries:', totalTimeEntries);

  const renderContent = () => {
    switch (currentView) {
      case 'clock':
        return <ClockInOut 
          employees={employees} 
          timeEntries={timeEntries} 
          pieceRateEntries={pieceRateEntries}
          clockIn={clockIn}
          clockOut={clockOut}
          punchInPieceRate={punchInPieceRate}
          getAvailableCoats={getAvailableCoats}
          getRemainingCoatPercentage={getRemainingCoatPercentage}
          getJobPieceRateProgress={getJobPieceRateProgress}
          completePieceRateEntry={completePieceRateEntry}
          getEmployeeActivePieceRateEntry={getEmployeeActivePieceRateEntry}
        />;
      case 'reports':
        return <TimeReports employees={employees} />;
      default:
        return <ClockInOut 
          employees={employees} 
          timeEntries={timeEntries} 
          pieceRateEntries={pieceRateEntries}
          clockIn={clockIn}
          clockOut={clockOut}
          punchInPieceRate={punchInPieceRate}
          getAvailableCoats={getAvailableCoats}
          getRemainingCoatPercentage={getRemainingCoatPercentage}
          getJobPieceRateProgress={getJobPieceRateProgress}
          completePieceRateEntry={completePieceRateEntry}
          getEmployeeActivePieceRateEntry={getEmployeeActivePieceRateEntry}
        />;
    }
  };

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
                  <CardTitle className="text-3xl font-bold">Time Clock System</CardTitle>
                  <p className="text-white/80 mt-1">Employee & Contractor Time Tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Safety Incident Button */}
                <Button 
                  onClick={() => setShowSafetyIncidentModal(true)}
                  variant="ghost" 
                  className="text-white hover:bg-white/20 border border-white/30"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Incident
                </Button>
                
                {/* Clear Time Entries Button */}
                {(
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Time Entries
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Time Entries?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all time entries, piece rate entries, and payroll reports. 
                          This action cannot be undone. Are you sure you want to clear all time data?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={clearAllTimeEntries}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Clear Time Entries
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {/* Clear All Data Button */}
                {(
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Time Entries?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all time entries, piece rate entries, payroll reports, job labor costs, and progress data. 
                          This action cannot be undone. Are you sure you want to start fresh?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => resetAllTimeAndPayrollData(resetAllJobLaborCosts)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Clear All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Delete Future Time Entries Button */}
                {(
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Delete Future Entries
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Future Time Entries?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete any time entries with future dates (like test data from 2025). 
                          This action cannot be undone. Are you sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={deleteFutureTimeEntries}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Yes, Delete Future Entries
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
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
              <Play className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Currently Working</p>
                <p className="font-semibold text-2xl">{currentlyWorking}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Total Entries</p>
                <p className="font-semibold text-2xl">{totalTimeEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setCurrentView('clock')}
          variant={currentView === 'clock' ? 'default' : 'outline'}
          className={currentView === 'clock' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          Clock In/Out
        </Button>
        <Button
          onClick={() => setCurrentView('reports')}
          variant={currentView === 'reports' ? 'default' : 'outline'}
          className={currentView === 'reports' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Time Reports
        </Button>
      </div>

      {renderContent()}

      {/* Safety Incident Modal */}
      <SafetyIncidentModal 
        isOpen={showSafetyIncidentModal}
        onClose={() => setShowSafetyIncidentModal(false)}
        employees={employees}
        jobs={jobs}
      />
    </div>
  );
};

export default TimeClock;