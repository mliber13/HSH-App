import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  X, 
  Calendar, 
  Building2, 
  Clock,
  GripVertical,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

const ScheduleComparisonView = ({ employees = [], schedules = [], jobs = [] }) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [comparisonData, setComparisonData] = useState({});
  const [draggedTask, setDraggedTask] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Generate week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentWeek]);

  // Get job name by ID
  const getJobName = useCallback((jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.jobName : 'Unknown Job';
  }, [jobs]);

  // Get employee name by ID
  const getEmployeeName = useCallback((employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  }, [employees]);

  // Get schedules for a specific employee and day
  const getSchedulesForEmployeeAndDay = useCallback((employeeId, date) => {
    return schedules.filter(schedule => {
      const scheduleStart = parseISO(schedule.startDate);
      const scheduleEnd = parseISO(schedule.endDate);
      const targetDate = new Date(date);
      
      return schedule.employeeIds && 
             schedule.employeeIds.includes(employeeId) && 
             targetDate >= scheduleStart && 
             targetDate <= scheduleEnd;
    });
  }, [schedules]);

  // Add employee to comparison
  const addEmployeeToComparison = useCallback((employeeId) => {
    if (selectedEmployees.length >= 5) return;
    if (selectedEmployees.includes(employeeId)) return;
    
    setSelectedEmployees(prev => [...prev, employeeId]);
  }, [selectedEmployees]);

  // Remove employee from comparison
  const removeEmployeeFromComparison = useCallback((employeeId) => {
    setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e, task, sourceEmployeeId, sourceDate) => {
    setDraggedTask({
      ...task,
      sourceEmployeeId,
      sourceDate
    });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, targetEmployeeId, targetDate) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    // Don't allow dropping on the same employee and date
    if (draggedTask.sourceEmployeeId === targetEmployeeId && 
        isSameDay(draggedTask.sourceDate, targetDate)) {
      return;
    }

    // Update the schedule in the comparison data
    setComparisonData(prev => {
      const newData = { ...prev };
      
      // Remove from source
      if (newData[draggedTask.sourceEmployeeId] && 
          newData[draggedTask.sourceEmployeeId][draggedTask.sourceDate]) {
        newData[draggedTask.sourceEmployeeId][draggedTask.sourceDate] = 
          newData[draggedTask.sourceEmployeeId][draggedTask.sourceDate].filter(
            task => task.id !== draggedTask.id
          );
      }
      
      // Add to target
      if (!newData[targetEmployeeId]) {
        newData[targetEmployeeId] = {};
      }
      if (!newData[targetEmployeeId][targetDate]) {
        newData[targetEmployeeId][targetDate] = [];
      }
      
      // Update the task with new assignment (using employeeIds array)
      const updatedTask = {
        ...draggedTask,
        employeeIds: [targetEmployeeId], // Replace with single employee
        startDate: targetDate.toISOString().split('T')[0],
        endDate: targetDate.toISOString().split('T')[0]
      };
      
      newData[targetEmployeeId][targetDate].push(updatedTask);
      
      return newData;
    });
    
    setDraggedTask(null);
  }, [draggedTask]);

  // Initialize comparison data when employees are selected
  React.useEffect(() => {
    const newData = {};
    
    selectedEmployees.forEach(employeeId => {
      newData[employeeId] = {};
      weekDays.forEach(date => {
        newData[employeeId][date] = getSchedulesForEmployeeAndDay(employeeId, date);
      });
    });
    
    setComparisonData(newData);
  }, [selectedEmployees, weekDays, getSchedulesForEmployeeAndDay]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-brandPrimary" />
          <h2 className="text-2xl font-bold text-gray-900">Schedule Comparison</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedEmployees.length}/5 employees
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCurrentWeek(prev => addDays(prev, -7))}
            variant="outline"
            size="sm"
          >
            Previous Week
          </Button>
          <Button
            onClick={() => setCurrentWeek(new Date())}
            variant="outline"
            size="sm"
          >
            This Week
          </Button>
          <Button
            onClick={() => setCurrentWeek(prev => addDays(prev, 7))}
            variant="outline"
            size="sm"
          >
            Next Week
          </Button>
        </div>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Select Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select onValueChange={addEmployeeToComparison}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Add employee to comparison" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter(emp => !selectedEmployees.includes(emp.id))
                  .map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{employee.firstName} {employee.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedEmployees.length === 5 && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Maximum 5 employees reached
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid */}
      {selectedEmployees.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="grid gap-2 mb-4" style={{ 
              gridTemplateColumns: `200px repeat(${selectedEmployees.length}, 300px)` 
            }}>
              <div className="h-12"></div> {/* Empty corner */}
              {selectedEmployees.map(employeeId => (
                <div key={employeeId} className="relative">
                  <Card className="h-12">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-brandPrimary" />
                        <span className="font-semibold text-sm">
                          {getEmployeeName(employeeId)}
                        </span>
                      </div>
                      <Button
                        onClick={() => removeEmployeeFromComparison(employeeId)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Day Rows */}
            {weekDays.map(date => (
              <div key={date.toISOString()} className="grid gap-2 mb-2" style={{ 
                gridTemplateColumns: `200px repeat(${selectedEmployees.length}, 300px)` 
              }}>
                {/* Day Header */}
                <div className="h-20">
                  <Card className="h-full">
                    <CardContent className="p-3 flex flex-col items-center justify-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(date, 'MMM d')}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Employee Columns */}
                {selectedEmployees.map(employeeId => (
                  <div key={`${employeeId}-${date.toISOString()}`} className="h-20">
                    <Card 
                      className="h-full"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, employeeId, date)}
                    >
                      <CardContent className="p-2 h-full overflow-y-auto">
                        <AnimatePresence>
                          {comparisonData[employeeId]?.[date]?.map((task, index) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mb-1"
                            >
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, task, employeeId, date)}
                                className="bg-blue-50 border border-blue-200 rounded p-2 cursor-move hover:bg-blue-100 transition-colors"
                              >
                                                                 <div className="flex items-center space-x-1 mb-1">
                                   <GripVertical className="h-3 w-3 text-blue-400" />
                                   <span className="text-xs font-medium text-blue-800">
                                     {getJobName(task.jobId)}
                                   </span>
                                 </div>
                                 <div className="text-xs text-gray-700 truncate">
                                   {task.title || task.name}
                                 </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {/* Drop zone indicator */}
                        {draggedTask && 
                         draggedTask.sourceEmployeeId !== employeeId && 
                         !isSameDay(draggedTask.sourceDate, date) && (
                          <div className="border-2 border-dashed border-blue-300 rounded p-2 text-center">
                            <div className="text-xs text-blue-500">
                              Drop here to move task
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedEmployees.length === 0 && (
        <Card className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employees Selected</h3>
          <p className="text-gray-600 mb-4">
            Select up to 5 employees to compare their schedules side-by-side.
          </p>
          <p className="text-sm text-gray-500">
            You can drag and drop tasks between employees to reassign them.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ScheduleComparisonView; 