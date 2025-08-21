import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Save, X, Users, Briefcase, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useSchedule } from '@/hooks/useScheduleProvider';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ScheduleFormModal = ({ isOpen, onClose, initialData, jobs, employees }) => {
  const [formData, setFormData] = useState({
    jobId: '',
    employeeIds: [],
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    duration: 1,
    useDuration: false,
    notes: '',
    status: 'scheduled',
    predecessorId: null,
    predecessorLag: 0
  });
  const [conflicts, setConflicts] = useState([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  
  // Local state for lag input to allow typing minus sign
  const [lagInputValue, setLagInputValue] = useState('');

  const { schedules, createSchedule, updateSchedule, checkForConflicts, hasCircularDependency } = useSchedule();

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.id) {
        // Editing existing schedule
        setFormData({
          jobId: initialData.jobId || '',
          employeeIds: initialData.employeeIds || [],
          title: initialData.title || '',
          startDate: initialData.start || new Date(),
          endDate: initialData.end || new Date(),
          duration: initialData.duration || 1,
          useDuration: initialData.useDuration || false,
          notes: initialData.notes || '',
          status: initialData.status || 'scheduled',
          predecessorId: initialData.predecessorId || null,
          predecessorLag: initialData.predecessorLag || 0
        });
        setLagInputValue(initialData.predecessorLag === 0 ? '' : String(initialData.predecessorLag || ''));
      } else {
        // Creating new schedule with pre-selected time slot
        setFormData(prev => ({
          ...prev,
          startDate: initialData.start || new Date(),
          endDate: initialData.end || new Date()
        }));
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.jobId) {
      toast({
        title: "Missing Information",
        description: "Please select a job.",
        variant: "destructive"
      });
      return;
    }

    if (formData.employeeIds.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one employee.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title for this schedule.",
        variant: "destructive"
      });
      return;
    }

    // Check for conflicts
    const potentialConflicts = checkForConflicts(
      formData.employeeIds,
      formData.startDate,
      formData.endDate,
      initialData?.id
    );

    if (potentialConflicts.length > 0 && !showConflictWarning) {
      setConflicts(potentialConflicts);
      setShowConflictWarning(true);
      return;
    }

    // Fix timezone issue by using local date formatting
    const formatDateForStorage = (date) => {
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return date;
    };

    // Create a date object that preserves the local date without timezone issues
    const createLocalDate = (dateString) => {
      if (typeof dateString === 'string') {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateString);
    };

    // Fix timezone issues by setting time to noon local time
    const fixTimezoneIssue = (date) => {
      if (date instanceof Date) {
        const fixedDate = new Date(date);
        fixedDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone shifts
        return fixedDate;
      }
      return date;
    };



    let startDate, endDate;
    
    if (formData.useDuration && formData.predecessorId) {
      // Calculate dates based on predecessor and lag
      const predecessor = schedules.find(s => s.id === formData.predecessorId);
      if (predecessor) {
        // Create a proper date object from the predecessor end date
        const [preYear, preMonth, preDay] = predecessor.endDate.split('-').map(Number);
        const predecessorEnd = new Date(preYear, preMonth - 1, preDay, 12, 0, 0, 0);
        
        const lagDays = formData.predecessorLag || 0;
        const newStartDate = new Date(predecessorEnd);
        newStartDate.setDate(newStartDate.getDate() + lagDays + 1); // +1 because 0 lag means next day
        
        startDate = formatDateForStorage(newStartDate);
        
        // Calculate end date based on duration
        const endDateObj = new Date(newStartDate);
        endDateObj.setDate(endDateObj.getDate() + formData.duration - 1);
        endDate = formatDateForStorage(endDateObj);
      } else {
        // Fallback to manual dates if predecessor not found
        const fixedStartDate = fixTimezoneIssue(formData.startDate);
        const fixedEndDate = fixTimezoneIssue(formData.endDate);
        startDate = formatDateForStorage(fixedStartDate);
        endDate = formatDateForStorage(fixedEndDate);
      }
    } else if (formData.useDuration) {
      // Use duration with manual start date
      const fixedStartDate = fixTimezoneIssue(formData.startDate);
      startDate = formatDateForStorage(fixedStartDate);
      const endDateObj = new Date(fixedStartDate);
      endDateObj.setDate(endDateObj.getDate() + formData.duration - 1);
      endDate = formatDateForStorage(endDateObj);
    } else {
      // Use manual start and end dates
      const fixedStartDate = fixTimezoneIssue(formData.startDate);
      const fixedEndDate = fixTimezoneIssue(formData.endDate);
      startDate = formatDateForStorage(fixedStartDate);
      endDate = formatDateForStorage(fixedEndDate);
    }
    


    
    const scheduleData = { ...formData, startDate, endDate };

    if (initialData?.id) {
      // Update existing schedule
      updateSchedule(initialData.id, scheduleData, () => {
        onClose();
      });
    } else {
      // Create new schedule
      createSchedule(scheduleData, () => {
        onClose();
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset conflict warning when form data changes
    if (showConflictWarning) {
      setShowConflictWarning(false);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setFormData(prev => {
      const currentEmployees = [...prev.employeeIds];
      
      if (currentEmployees.includes(employeeId)) {
        // Remove employee if already selected
        return {
          ...prev,
          employeeIds: currentEmployees.filter(id => id !== employeeId)
        };
      } else {
        // Add employee if not already selected
        return {
          ...prev,
          employeeIds: [...currentEmployees, employeeId]
        };
      }
    });
    
    // Reset conflict warning when employees change
    if (showConflictWarning) {
      setShowConflictWarning(false);
    }
  };

  const formatConflictTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        <DialogContent 
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-lg flex flex-col max-h-[90vh] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col"
          >
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6" />
              <DialogTitle className="text-2xl font-bold">
                {initialData?.id ? 'Edit Schedule' : 'Create New Schedule'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {showConflictWarning && conflicts.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Scheduling Conflicts Detected</h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        The following employees already have assignments during this time period:
                      </p>
                      <ul className="text-sm space-y-1">
                        {conflicts.map((conflict, index) => {
                          const employee = employees.find(e => e.id === conflict.employeeId);
                          const conflictJob = jobs.find(j => j.id === conflict.conflictingSchedule.jobId);
                          
                          return (
                            <li key={index} className="text-yellow-800">
                              <span className="font-medium">{employee?.firstName} {employee?.lastName}</span> - 
                              {conflictJob?.jobName || 'Unknown Job'} ({formatConflictTime(conflict.conflictingSchedule.startDate)} - 
                              {formatConflictTime(conflict.conflictingSchedule.endDate)})
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-3 flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowConflictWarning(false)}
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Adjust Schedule
                        </Button>
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={handleSubmit}
                          className="bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Schedule Anyway
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  Schedule Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Hanging Phase 1, Finishing Bedrooms"
                  className="border-2 focus:border-brandPrimary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Select Job *
                </Label>
                <Select
                  value={formData.jobId}
                  onValueChange={(value) => handleChange('jobId', value)}
                >
                  <SelectTrigger className="border-2 focus:border-brandPrimary">
                    <SelectValue placeholder="Choose job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.jobName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Predecessor Schedule (Optional)
                </Label>
                <Select
                  value={formData.predecessorId || 'none'}
                  onValueChange={(value) => {
                    const predecessorId = value === 'none' ? null : value;
                    if (predecessorId && initialData?.id && hasCircularDependency(initialData.id, predecessorId)) {
                      toast({
                        title: "Circular Dependency Detected",
                        description: "This would create a circular dependency. Please choose a different predecessor.",
                        variant: "destructive"
                      });
                      return;
                    }
                    handleChange('predecessorId', predecessorId);
                  }}
                >
                  <SelectTrigger className="border-2 focus:border-brandPrimary">
                    <SelectValue placeholder="Select predecessor schedule..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Predecessor</SelectItem>
                    {jobs.map(job => {
                      const jobSchedules = schedules.filter(s => s.jobId === job.id && s.id !== initialData?.id);
                      if (jobSchedules.length === 0) return null;
                      
                      return (
                        <div key={job.id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {job.jobName}
                          </div>
                          {jobSchedules.map(schedule => (
                            <SelectItem key={schedule.id} value={schedule.id}>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{schedule.title}</span>
                                <span className="text-xs text-gray-500">
                                  ({new Date(schedule.startDate).toLocaleDateString()})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.predecessorId && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      This schedule will automatically adjust when the predecessor schedule is moved.
                    </p>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Lag Days
                      </Label>
                      <input
                        type="text"
                        value={lagInputValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLagInputValue(value);
                          
                          // Update form data when we have a valid number
                          if (value === '' || value === '-') {
                            handleChange('predecessorLag', 0);
                          } else if (/^-?\d+$/.test(value)) {
                            const numValue = parseInt(value);
                            if (numValue >= -30 && numValue <= 30) {
                              handleChange('predecessorLag', numValue);
                            }
                          }
                        }}
                        onBlur={() => {
                          // When leaving the field, ensure we have a valid number
                          if (lagInputValue === '' || lagInputValue === '-') {
                            setLagInputValue('');
                            handleChange('predecessorLag', 0);
                          }
                        }}
                        placeholder="0"
                        className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-brandPrimary"
                      />
                                             <p className="text-xs text-gray-600">
                         {formData.predecessorLag === 0 && "Start the day after predecessor completes"}
                         {formData.predecessorLag === 1 && "Start 1 day after predecessor completes"}
                         {formData.predecessorLag === -1 && "Start on the same day predecessor completes"}
                         {formData.predecessorLag > 1 && `Start ${formData.predecessorLag} days after predecessor completes`}
                         {formData.predecessorLag < -1 && `Start ${Math.abs(formData.predecessorLag)} days before predecessor completes`}
                       </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Assign Employees *
                </Label>
                <div className="border-2 rounded-md p-2 max-h-40 overflow-y-auto">
                  {employees.map(employee => (
                    <div 
                      key={employee.id} 
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer mb-1 ${
                        formData.employeeIds.includes(employee.id) 
                          ? 'bg-brandSecondary/10 border border-brandSecondary/20' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleEmployeeChange(employee.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.employeeIds.includes(employee.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-brandSecondary"
                      />
                      <div>
                        <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                        <p className="text-xs text-gray-500">{employee.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Scheduling Method
                </Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="schedulingMethod"
                      checked={!formData.useDuration}
                      onChange={() => handleChange('useDuration', false)}
                      className="text-brandPrimary"
                    />
                    <span className="text-sm">Manual Start/End Dates</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="schedulingMethod"
                      checked={formData.useDuration}
                      onChange={() => handleChange('useDuration', true)}
                      className="text-brandPrimary"
                    />
                    <span className="text-sm">Duration-based</span>
                  </label>
                </div>
              </div>

              {formData.useDuration ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Start Date *
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => handleChange('startDate', date)}
                        dateFormat="MMMM d, yyyy"
                        className="w-full border-2 rounded-md p-2 focus:border-brandPrimary transition-colors"
                        disabled={formData.predecessorId !== null}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      {formData.predecessorId && (
                        <p className="text-xs text-blue-600 mt-1">
                          Start date will be calculated automatically based on predecessor
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Duration (Days) *
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', parseInt(e.target.value) || 1)}
                      className="border-2 focus:border-brandPrimary"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Start Date *
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => handleChange('startDate', date)}
                        dateFormat="MMMM d, yyyy"
                        className="w-full border-2 rounded-md p-2 focus:border-brandPrimary transition-colors"
                        disabled={formData.predecessorId !== null}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      {formData.predecessorId && (
                        <p className="text-xs text-blue-600 mt-1">
                          Start date will be calculated automatically based on predecessor
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      End Date *
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.endDate}
                        onChange={(date) => handleChange('endDate', date)}
                        dateFormat="MMMM d, yyyy"
                        className="w-full border-2 rounded-md p-2 focus:border-brandPrimary transition-colors"
                        minDate={formData.startDate}
                        disabled={formData.predecessorId !== null}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      {formData.predecessorId && (
                        <p className="text-xs text-blue-600 mt-1">
                          End date will be calculated automatically based on predecessor
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formData.predecessorId && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Predecessor Schedule Preview:</strong>
                  </p>
                  {(() => {
                    const predecessor = schedules.find(s => s.id === formData.predecessorId);
                    if (predecessor) {
                                             const [preYear, preMonth, preDay] = predecessor.endDate.split('-').map(Number);
                       const predecessorEnd = new Date(preYear, preMonth - 1, preDay, 12, 0, 0, 0);
                       const lagDays = formData.predecessorLag || 0;
                       const calculatedStart = new Date(predecessorEnd);
                       calculatedStart.setDate(calculatedStart.getDate() + lagDays + 1); // +1 because 0 lag means next day
                      
                      let calculatedEnd;
                      if (formData.useDuration && formData.duration) {
                        calculatedEnd = new Date(calculatedStart);
                        calculatedEnd.setDate(calculatedEnd.getDate() + formData.duration - 1);
                      } else {
                        calculatedEnd = new Date(calculatedStart);
                        calculatedEnd.setDate(calculatedEnd.getDate() + 1); // Default 1 day duration
                      }
                      
                      return (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-green-700">
                            <strong>Predecessor ends:</strong> {predecessorEnd.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-green-700">
                            <strong>Lag:</strong> {lagDays} day{lagDays !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-green-700">
                            <strong>This schedule will start:</strong> {calculatedStart.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-green-700">
                            <strong>This schedule will end:</strong> {calculatedEnd.toLocaleDateString()}
                          </p>
                        </div>
                      );
                    }
                    return <p className="text-xs text-green-700">Calculating...</p>;
                  })()}
                </div>
              )}
              
              {formData.useDuration && !formData.predecessorId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Calculated End Date:</strong> {
                      formData.startDate instanceof Date 
                        ? new Date(formData.startDate.getTime() + (formData.duration - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
                        : 'Select start date'
                    }
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="border-2 focus:border-brandPrimary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any notes about this schedule..."
                  className="border-2 focus:border-brandPrimary transition-colors min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-100">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" /> 
                {initialData?.id ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default ScheduleFormModal;