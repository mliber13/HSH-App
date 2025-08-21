import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Briefcase, FileText, Plus, Check, X, Building, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { getTemplates, convertTemplateToSchedule } from '@/services/scheduleTemplateService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ScheduleTemplateModal = ({ isOpen, onClose, jobs, employees, onSchedulesCreated, onManageTemplates }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedJob, setSelectedJob] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadedTemplates = getTemplates();
      setTemplates(loadedTemplates);
    }
  }, [isOpen]);

  const handleCreateSchedules = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Missing Template",
        description: "Please select a template.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedJob) {
      toast({
        title: "Missing Job",
        description: "Please select a job.",
        variant: "destructive"
      });
      return;
    }



    setLoading(true);

    try {
      // Convert template to schedules
      const schedules = convertTemplateToSchedule(
        selectedTemplate,
        selectedJob,
        startDate,
        [] // Empty array - employees will be assigned later in the schedule
      );

      // Call the callback to create the schedules
      await onSchedulesCreated(schedules);

      toast({
        title: "Schedules Created",
        description: `Created ${schedules.length} schedule entries from template "${selectedTemplate.name}"`,
      });

      // Reset form and close modal
      setSelectedTemplate(null);
      setSelectedJob('');
      setStartDate(new Date());
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create schedules. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  const getJobTypeIcon = (jobType) => {
    switch (jobType) {
      case 'residential':
        return <Briefcase className="h-4 w-4" />;
      case 'commercial':
        return <Building className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'residential':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'commercial':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Create Schedule from Template
            </div>
            {onManageTemplates && (
              <Button
                onClick={onManageTemplates}
                variant="outline"
                size="sm"
                className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label className="text-sm font-medium">Select Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-brandPrimary bg-brandPrimary/5'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getJobTypeIcon(template.jobType)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Check className="h-5 w-5 text-brandPrimary" />
                      )}
                    </div>
                    <Badge className={`w-fit ${getJobTypeColor(template.jobType)}`}>
                      {template.jobType}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{template.estimatedDuration} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{template.phases.length} phases</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Job Selection */}
          <div>
            <Label className="text-sm font-medium">Select Job</Label>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.filter(job => job.status === 'active').map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.jobName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          {/* Start Date */}
          <div>
            <Label className="text-sm font-medium">Start Date</Label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brandPrimary"
              dateFormat="MMM d, yyyy"
              minDate={new Date()}
            />
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div>
              <Label className="text-sm font-medium">Template Preview</Label>
              <Card className="mt-2">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {selectedTemplate.phases.map((phase, index) => (
                      <div key={phase.id} className="border-l-2 border-brandPrimary pl-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{phase.name}</h4>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                          <Badge variant="outline">{phase.duration} day{phase.duration !== 1 ? 's' : ''}</Badge>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateSchedules}
            disabled={!selectedTemplate || !selectedJob || loading}
            className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
          >
            {loading ? 'Creating...' : 'Create Schedules'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTemplateModal;
