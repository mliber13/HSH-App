import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Edit3, Trash2, Briefcase, Users, CheckCircle, Clock4, AlertCircle, Filter, Plus, Link, ArrowRight, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import { useSchedule } from '@/hooks/useScheduleProvider';
import { useJobs } from '@/hooks/useJobs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ScheduleFormModal from '@/components/ScheduleFormModal';
import ScheduleDetailsModal from '@/components/ScheduleDetailsModal';
import ScheduleTemplateModal from '@/components/ScheduleTemplateModal';
import TemplateManagementModal from '@/components/TemplateManagementModal';

const ScheduleList = ({ employees, initialJobId }) => {
  const [selectedJob, setSelectedJob] = useState(initialJobId || 'all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateManagementModal, setShowTemplateManagementModal] = useState(false);

  const { schedules, deleteSchedule, getDependentSchedules, createSchedule } = useSchedule();
  const { jobs } = useJobs();

  const activeJobs = jobs.filter(job => job.status === 'active');
  const activeEmployees = employees.filter(emp => emp.isActive);

  // Set job filter to initialJobId on mount if provided
  useEffect(() => {
    if (initialJobId) {
      setSelectedJob(initialJobId);
    }
  }, [initialJobId]);

  // Filter schedules based on selected criteria
  const filteredSchedules = useMemo(() => {
    let filtered = [...schedules];
    
    // Filter by job
    if (selectedJob !== 'all') {
      filtered = filtered.filter(schedule => schedule.jobId === selectedJob);
    }
    
    // Filter by employee
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(schedule => 
        schedule.employeeIds.includes(selectedEmployee)
      );
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === selectedStatus);
    }
    
    // Filter by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    if (dateFilter === 'today') {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.startDate);
        return isToday(scheduleDate);
      });
    } else if (dateFilter === 'tomorrow') {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.startDate);
        return isToday(addDays(scheduleDate, -1));
      });
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.startDate);
        return isAfter(scheduleDate, today) && isBefore(scheduleDate, nextWeek);
      });
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.startDate);
        return isAfter(scheduleDate, start) && isBefore(scheduleDate, end);
      });
    }
    
    // Sort by start date (most recent first)
    return filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [schedules, selectedJob, selectedEmployee, selectedStatus, dateFilter, customStartDate, customEndDate]);

  const handleViewDetails = (schedule) => {
    setSelectedSchedule({
      ...schedule,
      start: new Date(schedule.startDate),
      end: new Date(schedule.endDate)
    });
    setShowDetailsModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule({
      ...schedule,
      id: schedule.id,
      start: new Date(schedule.startDate),
      end: new Date(schedule.endDate)
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    deleteSchedule(scheduleId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center space-x-1">
            <Clock4 className="h-3 w-3" />
            <span>In Progress</span>
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Scheduled</span>
          </Badge>
        );
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Schedule List</h2>
          <p className="text-gray-600 mt-1">View and manage all scheduled assignments</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              setSelectedSchedule(null);
              setShowScheduleForm(true);
            }}
            className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
          <Button 
            onClick={() => setShowTemplateModal(true)}
            variant="outline"
            className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary hover:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            From Template
          </Button>
        </div>
      </div>

      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-brandSecondary" />
            Filter Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Job</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {activeJobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.jobName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {activeEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">Next 7 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateFilter === 'custom' && (
              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-brandPrimary" />
            Schedule Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No schedules found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new schedule</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule, index) => {
                const job = jobs.find(j => j.id === schedule.jobId) || {};
                const assignedEmployees = schedule.employeeIds
                  .map(id => employees.find(e => e.id === id))
                  .filter(Boolean);
                
                return (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(schedule)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg">{schedule.title}</h3>
                          {getStatusBadge(schedule.status)}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 text-brandPrimary" />
                          <span>{job.jobName || 'Unknown Job'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-brandSecondary" />
                          <span>{formatDateTime(schedule.startDate)}</span>
                          <span>to</span>
                          <Clock className="h-4 w-4 text-brandSecondary" />
                          <span>{formatDateTime(schedule.endDate)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>
                            {assignedEmployees.length > 0 
                              ? `${assignedEmployees.length} employee${assignedEmployees.length > 1 ? 's' : ''} assigned` 
                              : 'No employees assigned'}
                          </span>
                        </div>
                        
                        {/* Predecessor relationship */}
                        {schedule.predecessorId && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <Link className="h-4 w-4" />
                            <span>Depends on: </span>
                            <span className="font-medium">
                              {schedules.find(s => s.id === schedule.predecessorId)?.title || 'Unknown Schedule'}
                            </span>
                          </div>
                        )}
                        
                        {/* Dependent schedules */}
                        {(() => {
                          const dependents = getDependentSchedules(schedule.id);
                          if (dependents.length > 0) {
                            return (
                              <div className="flex items-center space-x-2 text-sm text-green-600">
                                <ArrowRight className="h-4 w-4" />
                                <span>Leads to: </span>
                                <span className="font-medium">
                                  {dependents.length === 1 
                                    ? dependents[0].title 
                                    : `${dependents.length} dependent schedules`}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      <div className="flex space-x-2 self-end md:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchedule(schedule);
                          }}
                          className="text-brandSecondary hover:bg-brandSecondary/10"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this schedule? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSchedule(schedule.id)} 
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <ScheduleFormModal
          isOpen={showScheduleForm}
          onClose={() => setShowScheduleForm(false)}
          initialData={selectedSchedule}
          jobs={jobs}
          employees={employees}
        />
      )}

      {/* Schedule Details Modal */}
      {showDetailsModal && selectedSchedule && (
        <ScheduleDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          schedule={selectedSchedule}
          jobs={jobs}
          employees={employees}
          onEdit={(schedule) => {
            setSelectedSchedule(schedule);
            setShowDetailsModal(false);
            setShowScheduleForm(true);
          }}
        />
      )}

      {/* Schedule Template Modal */}
      {showTemplateModal && (
        <ScheduleTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          jobs={activeJobs}
          employees={employees}
          onSchedulesCreated={async (schedules) => {
            // Create each schedule using the existing schedule system
            for (const schedule of schedules) {
              await createSchedule(schedule);
            }
          }}
          onManageTemplates={() => {
            setShowTemplateModal(false);
            setShowTemplateManagementModal(true);
          }}
        />
      )}

      {/* Template Management Modal */}
      {showTemplateManagementModal && (
        <TemplateManagementModal
          isOpen={showTemplateManagementModal}
          onClose={() => setShowTemplateManagementModal(false)}
          onTemplatesUpdated={() => {
            // Refresh templates if needed
          }}
        />
      )}
    </div>
  );
};

export default ScheduleList;