import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, X, Home, Building, MapPin, Navigation, CheckCircle, Users, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import locationService from '@/services/locationService';
import { getGeneralContractors, getSuperintendents, getProjectManagers } from '@/services/clientPortalService';

const CreateJobForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    jobName: '',
    jobType: '', // New field for job type
    generalContractorId: '',
    superintendentId: '',
    projectManagerId: '',
    address: '',
    lockboxCode: '',
    geofenceRadius: locationService.getGeofenceRadius()
  });


  const [generalContractors, setGeneralContractors] = useState([]);
  const [superintendents, setSuperintendents] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);

  // Load existing data
  useEffect(() => {
    const existingGCs = getGeneralContractors();
    const existingSupers = getSuperintendents();
    const existingPMs = getProjectManagers();
    setGeneralContractors(existingGCs);
    setSuperintendents(existingSupers);
    setProjectManagers(existingPMs);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.jobName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a job name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.jobType) {
      toast({
        title: "Missing Information",
        description: "Please select a job type (Residential or Commercial).",
        variant: "destructive"
      });
      return;
    }

    if (!formData.generalContractorId) {
      toast({
        title: "Missing Information", 
        description: "Please select a General Contractor.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the job site address.",
        variant: "destructive"
      });
      return;
    }

    // Get the names from the selected IDs for the job data
    const selectedGC = generalContractors.find(gc => gc.id === formData.generalContractorId);
    const selectedSuper = formData.superintendentId ? superintendents.find(s => s.id === formData.superintendentId) : null;
    const selectedPM = formData.projectManagerId ? projectManagers.find(pm => pm.id === formData.projectManagerId) : null;

    const jobData = {
      ...formData,
      generalContractor: selectedGC ? selectedGC.name : '',
      superintendent: selectedSuper ? selectedSuper.name : '',
      projectManager: selectedPM ? selectedPM.name : ''
    };

    onSubmit(jobData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (address) => {
    handleChange('address', address);
    
    // If address is provided, we'll use it for location tracking
    // In a real implementation, you would geocode the address here
    // For now, we'll just update the form data
    if (address.trim()) {
      // This is where you would call a geocoding service
      // For demo purposes, we'll leave coordinates empty for manual entry
      // or you could integrate with Google Maps Geocoding API, MapBox, etc.
    }
  };



  // Get filtered lists based on selected GC
  const getFilteredSuperintendents = () => {
    if (!formData.generalContractorId) return [];
    return superintendents.filter(s => s.gcId === formData.generalContractorId);
  };

  const getFilteredProjectManagers = () => {
    if (!formData.generalContractorId) return [];
    return projectManagers.filter(pm => pm.gcId === formData.generalContractorId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Create New Job</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobName" className="text-sm font-semibold text-gray-700">
                  Job Name *
                </Label>
                <Input
                  id="jobName"
                  value={formData.jobName}
                  onChange={(e) => handleChange('jobName', e.target.value)}
                  placeholder="Enter job name"
                  className="border-2 focus:border-brandPrimary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Job Type *
                </Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) => handleChange('jobType', value)}
                >
                  <SelectTrigger className="border-2 focus:border-brandPrimary">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span>Residential</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="commercial">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Commercial</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>



            {/* Project Team Section */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">
                Project Team
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    General Contractor *
                  </Label>
                  <Select
                    value={formData.generalContractorId}
                    onValueChange={(value) => {
                      handleChange('generalContractorId', value);
                      // Clear superintendent and PM when GC changes
                      handleChange('superintendentId', '');
                      handleChange('projectManagerId', '');
                    }}
                  >
                    <SelectTrigger className="border-2 focus:border-brandPrimary">
                      <SelectValue placeholder="Select General Contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {generalContractors.map(gc => (
                        <SelectItem key={gc.id} value={gc.id}>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{gc.name}</span>
                            {gc.company && (
                              <span className="text-xs text-gray-500">({gc.company})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Superintendent
                  </Label>
                  <Select
                    value={formData.superintendentId}
                    onValueChange={(value) => handleChange('superintendentId', value)}
                    disabled={!formData.generalContractorId}
                  >
                    <SelectTrigger className="border-2 focus:border-brandPrimary">
                      <SelectValue placeholder={formData.generalContractorId ? "Select Superintendent" : "Select GC first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredSuperintendents().map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{s.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Project Manager
                  </Label>
                  <Select
                    value={formData.projectManagerId}
                    onValueChange={(value) => handleChange('projectManagerId', value)}
                    disabled={!formData.generalContractorId}
                  >
                    <SelectTrigger className="border-2 focus:border-brandPrimary">
                      <SelectValue placeholder={formData.generalContractorId ? "Select Project Manager" : "Select GC first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredProjectManagers().map(pm => (
                        <SelectItem key={pm.id} value={pm.id}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{pm.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Help text */}
              {!formData.generalContractorId && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Project Team Setup</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    Select a General Contractor first to enable Superintendent and Project Manager selection. 
                    You can manage these contacts in the Client Portal.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockboxCode" className="text-sm font-semibold text-gray-700">
                Lockbox Code
              </Label>
              <Input
                id="lockboxCode"
                value={formData.lockboxCode}
                onChange={(e) => handleChange('lockboxCode', e.target.value)}
                placeholder="Enter lockbox code"
                className="border-2 focus:border-brandPrimary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                Job Site Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Enter job site address"
                className="border-2 focus:border-brandPrimary transition-colors"
              />
            </div>

            {/* Location Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">
                  Location Tracking
                </Label>
                <Badge variant="outline" className="text-xs">
                  Address Based
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geofenceRadius" className="text-sm font-semibold text-gray-700">
                  Clock-in Radius (feet)
                </Label>
                <Input
                  id="geofenceRadius"
                  type="number"
                  value={formData.geofenceRadius}
                  onChange={(e) => handleChange('geofenceRadius', parseInt(e.target.value) || 500)}
                  placeholder="500"
                  className="border-2 focus:border-brandPrimary transition-colors"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Location Tracking</span>
                </div>
                <p className="text-xs text-blue-600">
                  Employees must be within {formData.geofenceRadius} feet of the job site address to clock in/out. 
                  This helps ensure accurate time tracking and job site verification.
                </p>
              </div>
            </div>

            {/* Job Type Information */}
            {formData.jobType && (
              <div className={`p-4 rounded-lg border-2 ${
                formData.jobType === 'residential' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {formData.jobType === 'residential' ? (
                    <Home className="h-5 w-5 text-green-600" />
                  ) : (
                    <Building className="h-5 w-5 text-blue-600" />
                  )}
                  <h4 className={`font-semibold ${
                    formData.jobType === 'residential' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {formData.jobType === 'residential' ? 'Residential Job' : 'Commercial Job'}
                  </h4>
                </div>
                <p className={`text-sm ${
                  formData.jobType === 'residential' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {formData.jobType === 'residential' 
                    ? 'Takeoffs will be organized by Floor/Space/Room names (e.g., "2nd Floor", "Master Bedroom", "Garage").'
                    : 'Takeoffs will be organized by Unit Types with multiple unit numbers (e.g., "Unit Type 1A" with units 501, 502, 503).'
                  }
                </p>
              </div>
            )}

            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold py-3"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Job
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-2 hover:bg-gray-50 font-semibold py-3"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateJobForm;