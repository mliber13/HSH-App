import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, List, Clock, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchedule, ScheduleProvider } from '@/hooks/useScheduleProvider';
import { useJobs } from '@/hooks/useJobs';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import ScheduleList from '@/components/ScheduleList';
import ScheduleComparisonView from '@/components/ScheduleComparisonView';

const ScheduleDashboard = ({ employees, initialJobId }) => {
  const [currentView, setCurrentView] = useState('calendar');
  
  const { schedules, loading } = useSchedule();
  const { jobs } = useJobs();

  console.log('ScheduleDashboard rendering with employees:', employees);

  const activeJobs = jobs.filter(job => job.status === 'active');
  const activeEmployees = employees.filter(emp => emp.isActive);

  // Count schedules by status
  const scheduledCount = schedules.filter(s => s.status === 'scheduled').length;
  const inProgressCount = schedules.filter(s => s.status === 'in-progress').length;
  const completedCount = schedules.filter(s => s.status === 'completed').length;
  const cancelledCount = schedules.filter(s => s.status === 'cancelled').length;

  // Get today's schedules
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaySchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startDate);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate.getTime() === today.getTime();
  });

  if (loading) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
        <p className="text-gray-600 font-medium">Loading schedule data...</p>
      </div>
    );
  }

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
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Schedule Management</CardTitle>
                  <p className="text-white/80 mt-1">Assign employees to jobs and manage work schedules</p>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Scheduled</p>
                <p className="font-semibold text-2xl">{scheduledCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">In Progress</p>
                <p className="font-semibold text-2xl">{inProgressCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Today's Schedules</p>
                <p className="font-semibold text-2xl">{todaySchedules.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <List className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Total Schedules</p>
                <p className="font-semibold text-2xl">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setCurrentView('calendar')}
          variant={currentView === 'calendar' ? 'default' : 'outline'}
          className={currentView === 'calendar' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendar View
        </Button>
        <Button
          onClick={() => setCurrentView('list')}
          variant={currentView === 'list' ? 'default' : 'outline'}
          className={currentView === 'list' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <List className="h-4 w-4 mr-2" />
          List View
        </Button>
        <Button
          onClick={() => setCurrentView('comparison')}
          variant={currentView === 'comparison' ? 'default' : 'outline'}
          className={currentView === 'comparison' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Comparison View
        </Button>
      </div>

      {currentView === 'calendar' ? (
        <ScheduleCalendar employees={employees} initialJobId={initialJobId} />
      ) : currentView === 'list' ? (
        <ScheduleList employees={employees} initialJobId={initialJobId} />
      ) : (
        <ScheduleComparisonView employees={employees} schedules={schedules} jobs={jobs} />
      )}
    </div>
  );
};

export default function ScheduleDashboardWithProvider(props) {
  return (
    <ScheduleProvider>
      <ScheduleDashboard {...props} />
    </ScheduleProvider>
  );
}