import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, User, Calendar, Trash2, Archive, Eye, Filter, Calculator, Play, Home, Building, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGeneralContractors } from '@/services/clientPortalService';

const JobsList = ({ jobs, onSelectJob, onDeleteJob, onUpdateJobStatus }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [gcFilter, setGcFilter] = useState("all");
  const [generalContractors, setGeneralContractors] = useState([]);

  // Load general contractors for filter
  useEffect(() => {
    const gcs = getGeneralContractors();
    setGeneralContractors(gcs);
  }, []);

  const filteredJobs = jobs.filter(job => {
    // First filter by status tab
    if (activeTab === "estimating") {
      if (job.status !== 'estimating' && (job.status || job.takeoffPhases?.length)) {
        return false;
      }
    } else if (activeTab === "active") {
      if (job.status !== 'active') return false;
    } else if (activeTab === "inactive") {
      if (job.status !== 'inactive') return false;
    }
    
    // Then filter by job type
    if (jobTypeFilter !== "all" && job.jobType !== jobTypeFilter) {
      return false;
    }
    
    // Then filter by general contractor
    if (gcFilter !== "all" && job.generalContractor !== gcFilter) {
      return false;
    }
    
    return true;
  });

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="construction-pattern rounded-2xl p-12 max-w-md mx-auto bg-white/70 shadow-lg">
          <Building2 className="h-16 w-16 mx-auto text-brandPrimary mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Jobs Yet</h2>
          <p className="text-gray-600 mb-6">Start by creating your first construction job to manage scopes and takeoffs.</p>
        </div>
      </motion.div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'estimating':
        return <Calculator className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'inactive':
        return <Archive className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'estimating':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getJobTypeIcon = (jobType) => {
    return jobType === 'residential' ? <Home className="h-4 w-4" /> : <Building className="h-4 w-4" />;
  };

  const getJobTypeColor = (jobType) => {
    return jobType === 'residential' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusActions = (job) => {
    // No status actions on the dashboard - moved to job details page
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Job Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your construction projects by phase.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto">
              <TabsTrigger value="estimating">
                <Calculator className="h-4 w-4 mr-1 sm:mr-2 inline-block"/>
                Estimating
              </TabsTrigger>
              <TabsTrigger value="active">
                <Play className="h-4 w-4 mr-1 sm:mr-2 inline-block"/>
                Active
              </TabsTrigger>
              <TabsTrigger value="inactive">
                <Archive className="h-4 w-4 mr-1 sm:mr-2 inline-block"/>
                Inactive
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs value={jobTypeFilter} onValueChange={setJobTypeFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto list-none">
              <TabsTrigger value="all">
                <Filter className="h-4 w-4 mr-1 sm:mr-2 inline-block"/>
                All Types
              </TabsTrigger>
              <TabsTrigger value="residential">
                <Home className="h-4 w-4 mr-1 sm:mr-2 inline-block"/>
                Residential
              </TabsTrigger>
              <TabsTrigger value="commercial">
                <Building className="h-4 w-4 mr-1 sm:mr-2 inline-block"/>
                Commercial
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={gcFilter} onValueChange={setGcFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All GCs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>All General Contractors</span>
                </div>
              </SelectItem>
              {generalContractors.map((gc) => (
                <SelectItem key={gc.id} value={gc.name}>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>{gc.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>
      
      {filteredJobs.length === 0 && (
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
        >
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No {activeTab} jobs found.</p>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'estimating' ? 'Create a new job to start estimating.' : 
               activeTab === 'active' ? 'Move jobs from estimating to active to start field work.' :
               'Try a different filter or create a new job.'}
            </p>
            {jobTypeFilter !== 'all' && (
              <p className="text-gray-500 text-sm mt-1">
                No {jobTypeFilter} jobs in this category. Try changing the job type filter.
              </p>
            )}
            {gcFilter !== 'all' && (
              <p className="text-gray-500 text-sm mt-1">
                No jobs found for {gcFilter}. Try changing the General Contractor filter.
              </p>
            )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => {
          const jobStatus = job.status || 'estimating';
          const jobType = job.jobType || 'residential';
          
          return (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className={`h-full flex flex-col hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm ${
                jobStatus === 'estimating' ? 'border-l-4 border-brandSecondary' :
                jobStatus === 'active' ? 'border-l-4 border-brandPrimary' : 
                'border-l-4 border-slate-400'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg group-hover:opacity-80 transition-colors ${
                        jobStatus === 'estimating' ? 'bg-brandSecondary/10' :
                        jobStatus === 'active' ? 'bg-brandPrimary/10' : 
                        'bg-slate-100'
                      }`}>
                        <Building2 className={`h-5 w-5 ${
                          jobStatus === 'estimating' ? 'text-brandSecondary' :
                          jobStatus === 'active' ? 'text-brandPrimary' : 
                          'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-brandPrimary transition-colors">
                          {job.jobName}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                          <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(jobStatus)}`}>
                            {getStatusIcon(jobStatus)}
                            <span className="capitalize">{jobStatus}</span>
                          </span>
                          <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium ${getJobTypeColor(jobType)}`}>
                            {getJobTypeIcon(jobType)}
                            <span className="capitalize">{jobType}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 flex-grow">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-brandSecondary" />
                    <span className="font-medium">GC:</span>
                    <span>{job.generalContractor}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Address:</span>
                    <span className="truncate">{job.address || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-brandPrimary" />
                    <span className="font-medium">Created:</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Progress indicators */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Scopes: {job.scopes?.length || 0}</span>
                      <span>Takeoffs: {job.takeoffPhases?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t mt-auto">
                  <div className="flex items-center justify-between w-full">
                    <Button
                      onClick={() => onSelectJob(job)}
                      size="sm"
                      variant="outline"
                      className="border-brandSecondary text-brandSecondary hover:bg-brandSecondary/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Job "{job.jobName}"?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the job and all associated data.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                                      Yes, delete
                                  </AlertDialogAction>
                                                        </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JobsList;