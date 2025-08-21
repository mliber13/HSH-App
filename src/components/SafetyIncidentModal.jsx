import React, { useState } from 'react';
import { AlertTriangle, Save, X, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import locationService from '@/services/locationService';

const SafetyIncidentModal = ({ isOpen, onClose, employees = [], jobs = [] }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    jobId: '',
    type: '',
    severity: '',
    description: '',
    witnesses: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incidentTypes = [
    'injury', 'near-miss', 'property-damage', 'hazard', 'equipment-failure', 'weather-related'
  ];
  
  const severityLevels = [
    'minor', 'moderate', 'serious', 'critical'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.jobId || !formData.type || !formData.severity || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current location
      const location = await locationService.getCurrentLocation();
      
      // Find nearest job site
      const nearestSite = locationService.findNearestJobSite(location.latitude, location.longitude, formData.jobId);
      
      // Report the incident
      locationService.addSafetyIncident({
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
        siteId: nearestSite?.id,
        reportedBy: employees.find(e => e.id === formData.employeeId)?.name || 'Unknown'
      });

      toast({
        title: "Safety Incident Reported! 🚨",
        description: "The incident has been logged and will be investigated."
      });

      // Reset form
      setFormData({
        employeeId: '',
        jobId: '',
        type: '',
        severity: '',
        description: '',
        witnesses: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-red-800">Report Safety Incident</CardTitle>
                <p className="text-red-600 text-sm">Quick incident reporting with location tracking</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incident-employee">Employee *</Label>
                <Select value={formData.employeeId} onValueChange={(value) => handleChange('employeeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incident-job">Job Site *</Label>
                <Select value={formData.jobId} onValueChange={(value) => handleChange('jobId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job" />
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
              
              <div className="space-y-2">
                <Label htmlFor="incident-type">Incident Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incident-severity">Severity *</Label>
                <Select value={formData.severity} onValueChange={(value) => handleChange('severity', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map(severity => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incident-description">Description *</Label>
              <Textarea
                id="incident-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what happened..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incident-witnesses">Witnesses (optional)</Label>
              <Input
                id="incident-witnesses"
                value={formData.witnesses}
                onChange={(e) => handleChange('witnesses', e.target.value)}
                placeholder="Names of any witnesses..."
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Location Tracking</span>
              </div>
              <p className="text-xs text-blue-600">
                Your current location will be automatically captured when you submit this report.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Reporting...' : 'Report Incident'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyIncidentModal;
