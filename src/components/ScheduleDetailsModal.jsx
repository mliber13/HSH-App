import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Edit3, Trash2, X, Briefcase, Users, FileText, CheckCircle, AlertCircle, Clock4, Link, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSchedule } from '@/hooks/useScheduleProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ScheduleDetailsModal = ({ isOpen, onClose, schedule, jobs, employees, onEdit }) => {
  const { schedules, updateSchedule, deleteSchedule, getDependentSchedules } = useSchedule();

  if (!schedule) return null;

  const job = jobs.find(j => j.id === schedule.jobId) || {};
  const assignedEmployees = schedule.employeeIds
    .map(id => employees.find(e => e.id === id))
    .filter(Boolean);

  const formatDateTime = (date) => {
    return format(new Date(date), 'MMMM d, yyyy');
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

  const handleStatusChange = (newStatus) => {
    updateSchedule(schedule.id, { status: newStatus });
  };

  const handleDelete = () => {
    deleteSchedule(schedule.id, () => {
      onClose();
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
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-lg flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col"
          >
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6" />
                <DialogTitle className="text-2xl font-bold">{schedule.title}</DialogTitle>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(schedule.status)}
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Briefcase className="h-5 w-5 text-brandPrimary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Job</p>
                <p className="font-semibold text-gray-900">{job.jobName || 'Unknown Job'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-brandSecondary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-semibold text-gray-900">{formatDateTime(schedule.start)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-brandSecondary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-semibold text-gray-900">{formatDateTime(schedule.end)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-brandPrimary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Assigned Employees</p>
                <div className="mt-1 space-y-1">
                  {assignedEmployees.length > 0 ? (
                    assignedEmployees.map(employee => (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {employee.role}
                        </Badge>
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No employees assigned</p>
                  )}
                </div>
              </div>
            </div>
            
            {schedule.notes && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">{schedule.notes}</p>
                </div>
              </div>
            )}

            {/* Predecessor relationship */}
            {schedule.predecessorId && (
              <div className="flex items-start space-x-3">
                <Link className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Depends on</p>
                  <p className="font-semibold text-blue-600">
                    {schedules.find(s => s.id === schedule.predecessorId)?.title || 'Unknown Schedule'}
                  </p>
                </div>
              </div>
            )}

            {/* Dependent schedules */}
            {(() => {
              const dependents = getDependentSchedules(schedule.id);
              if (dependents.length > 0) {
                return (
                  <div className="flex items-start space-x-3">
                    <ArrowRight className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Leads to</p>
                      <div className="space-y-1">
                        {dependents.map(dependent => (
                          <p key={dependent.id} className="font-semibold text-green-600">
                            {dependent.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('scheduled')}
                  className={`${schedule.status === 'scheduled' ? 'bg-blue-100 border-blue-300' : ''}`}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Scheduled
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('in-progress')}
                  className={`${schedule.status === 'in-progress' ? 'bg-yellow-100 border-yellow-300' : ''}`}
                >
                  <Clock4 className="h-3.5 w-3.5 mr-1" />
                  In Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('completed')}
                  className={`${schedule.status === 'completed' ? 'bg-green-100 border-green-300' : ''}`}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Completed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('cancelled')}
                  className={`${schedule.status === 'cancelled' ? 'bg-red-100 border-red-300' : ''}`}
                >
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Cancelled
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
            <div className="flex justify-between w-full">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
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
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <div className="space-x-2">
                <Button 
                  onClick={() => {
                    onEdit(schedule);
                    onClose();
                  }}
                  className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" onClick={onClose} className="hover:bg-gray-100">
                  <X className="h-4 w-4 mr-2" /> Close
                </Button>
              </div>
            </div>
          </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default ScheduleDetailsModal;