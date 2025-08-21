import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, FileText } from 'lucide-react';
import { useSchedule } from '@/hooks/useScheduleProvider';
import { useJobs } from '@/hooks/useJobs';
import ScheduleFormModal from '@/components/ScheduleFormModal';
import ScheduleDetailsModal from '@/components/ScheduleDetailsModal';
import ScheduleTemplateModal from '@/components/ScheduleTemplateModal';
import TemplateManagementModal from '@/components/TemplateManagementModal';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const DnDCalendar = withDragAndDrop(Calendar);

const ScheduleCalendar = ({ employees, initialJobId }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedJob, setSelectedJob] = useState(initialJobId || 'all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateManagementModal, setShowTemplateManagementModal] = useState(false);

  const { schedules, getCalendarEvents, updateSchedule, createSchedule } = useSchedule();
  const { jobs } = useJobs();

  const activeJobs = jobs.filter(job => job.status === 'active');
  const activeEmployees = employees.filter(emp => emp.isActive);

  // Filter events based on selected job and employee
  const filteredEvents = useMemo(() => {
    const allEvents = getCalendarEvents(jobs, employees);
    
    return allEvents.filter(event => {
      const jobMatch = selectedJob === 'all' || event.jobId === selectedJob;
      const employeeMatch = selectedEmployee === 'all' || 
        event.employeeIds.includes(selectedEmployee);
      
      return jobMatch && employeeMatch;
    });
  }, [getCalendarEvents, jobs, employees, selectedJob, selectedEmployee]);

  // Set job filter to initialJobId on mount if provided
  useEffect(() => {
    if (initialJobId) {
      setSelectedJob(initialJobId);
    }
  }, [initialJobId]);

  // Handler for drag-and-drop event move
  const handleEventDrop = useCallback(({ event, start, end }) => {
    // Only update if the date actually changed
    if (start && end && (start.getTime() !== event.start.getTime() || end.getTime() !== event.end.getTime())) {
      updateSchedule(event.id, {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      });
    }
  }, [updateSchedule]);

  // Handler for resizing events (if you want to allow it)
  const handleEventResize = useCallback(({ event, start, end }) => {
    updateSchedule(event.id, {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  }, [updateSchedule]);

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    // When a user selects a time slot, open the schedule form
    setShowScheduleForm(true);
    // Pre-fill the form with the selected time slot
    setSelectedEvent({
      start,
      end,
      employeeIds: []
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Custom event component
  const EventComponent = ({ event }) => (
    <div 
      className="p-1 overflow-hidden text-xs relative"
      style={{ 
        backgroundColor: event.backgroundColor,
        color: 'white',
        borderRadius: '4px',
        height: '100%'
      }}
    >
      <div className="font-bold truncate">{event.title}</div>
      <div className="truncate">{event.jobName}</div>
      {event.predecessorId && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full" title="Has predecessor"></div>
      )}
    </div>
  );

  // Custom toolbar component
  const CustomToolbar = ({ onNavigate, onView, label }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold">{label}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant={view === 'month' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView('month')}
          className={view === 'month' ? 'bg-brandSecondary' : ''}
        >
          Month
        </Button>
        <Button 
          variant={view === 'week' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView('week')}
          className={view === 'week' ? 'bg-brandSecondary' : ''}
        >
          Week
        </Button>
        <Button 
          variant={view === 'day' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView('day')}
          className={view === 'day' ? 'bg-brandSecondary' : ''}
        >
          Day
        </Button>
        <Button 
          variant={view === 'agenda' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onView('agenda')}
          className={view === 'agenda' ? 'bg-brandSecondary' : ''}
        >
          Agenda
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Schedule Calendar</h2>
          <p className="text-gray-600 mt-1">Manage job assignments and employee schedules</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {activeJobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.jobName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => {
                setSelectedEvent(null);
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
      </div>

      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-brandSecondary" />
            Work Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[700px]">
            <DnDCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={handleViewChange}
              date={date}
              onNavigate={handleNavigate}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar
              }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.backgroundColor,
                  borderColor: event.borderColor
                }
              })}
              formats={{
                timeGutterFormat: (date, culture, localizer) =>
                  localizer.format(date, 'h:mm a', culture),
                selectRangeFormat: ({ start, end }, culture, localizer) =>
                  localizer.format(start, 'h:mm a', culture) + ' - ' +
                  localizer.format(end, 'h:mm a', culture)
              }}
              draggableAccessor={() => true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <ScheduleFormModal
          isOpen={showScheduleForm}
          onClose={() => setShowScheduleForm(false)}
          initialData={selectedEvent}
          jobs={activeJobs}
          employees={employees}
        />
      )}

      {/* Schedule Details Modal */}
      {showDetailsModal && selectedEvent && (
        <ScheduleDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          schedule={selectedEvent}
          jobs={jobs}
          employees={employees}
          onEdit={(schedule) => {
            setSelectedEvent(schedule);
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

export default ScheduleCalendar;