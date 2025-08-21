import React from 'react';
import { motion } from 'framer-motion';
import { Building2, User, MapPin, Key, Edit3, Trash2, DollarSign, FileText, X, Home, Building, Calculator, Play, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const JobHeader = ({ 
  job, 
  isEditingJobInfo, 
  editFormData, 
  setEditFormData, 
  setIsEditingJobInfo, 
  handleSaveJobInfo, 
  handleCancelJobEdit, 
  onShowFinancials, 
  onShowTakeoffReport, 
  onDeleteJob, 
  onUpdateJob,
  takeoffPhases, 
  generalContractors, 
  superintendents, 
  projectManagers, 
  statusDisplay, 
  StatusIcon 
}) => {
  const jobType = job.jobType || 'residential';
  const jobStatus = job.status || 'estimating';

  const getStatusActions = () => {
    if (jobStatus === 'estimating') {
      // Estimating jobs can be activated or deleted
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'active' })}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Activate Job
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the job and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, delete job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    } else if (jobStatus === 'active') {
      // Active jobs can be set to inactive or back to estimating
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'inactive' })}
            variant="outline"
            size="sm"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 text-xs"
          >
            <Archive className="h-3 w-3 mr-1" />
            Set Inactive
          </Button>
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'estimating' })}
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            Back to Estimating
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the job and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, delete job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    } else {
      // Inactive jobs can be reactivated or moved back to estimating
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'active' })}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Reactivate
          </Button>
          <Button
            onClick={() => onUpdateJob(job.id, { status: 'estimating' })}
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            Back to Estimating
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Job
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the job and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Yes, delete job
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                {isEditingJobInfo ? (
                  <div className="space-y-2">
                    <Input
                      value={editFormData.jobName}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, jobName: e.target.value }))}
                      placeholder="Enter job name"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                ) : (
                  <CardTitle className="text-3xl font-bold">{job?.jobName}</CardTitle>
                )}
                <div className="flex items-center space-x-3 mt-2">
                  <p className="text-white/80">Construction Job Details</p>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} text-gray-800`}>
                    <StatusIcon />
                    <span>{statusDisplay.text}</span>
                  </span>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    jobType === 'residential' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {jobType === 'residential' ? <Home className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                    <span className="capitalize">{jobType}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              {/* Primary Actions Row */}
              <div className="flex items-center space-x-2">
                {!isEditingJobInfo ? (
                  <>
                    <Button
                      onClick={() => setIsEditingJobInfo(true)}
                      variant="outline"
                      className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Job Info
                    </Button>
                    {/* Always show Financials and Takeoff Report buttons */}
                    <Button
                      onClick={onShowFinancials}
                      variant="outline"
                      className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financials
                    </Button>
                    {/* Only show Takeoff Report if there are takeoff phases */}
                    {takeoffPhases.length > 0 && (
                      <Button
                        onClick={onShowTakeoffReport}
                        variant="outline"
                        className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Takeoff Report
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleCancelJobEdit}
                      variant="outline"
                      className="bg-white/10 text-white hover:bg-white/20 border-white/30"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveJobInfo}
                      className="bg-white text-brandPrimary hover:bg-white/90"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
              {/* Status Actions Row */}
              <div className="flex items-center space-x-2">
                {getStatusActions()}
              </div>
            </div>
          </div>
        </CardHeader>
        
        {isEditingJobInfo && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Job Type</label>
                <Select value={editFormData.jobType} onValueChange={(value) => setEditFormData(prev => ({ ...prev, jobType: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">General Contractor</label>
                <Select value={editFormData.generalContractor} onValueChange={(value) => setEditFormData(prev => ({ ...prev, generalContractor: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select general contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {generalContractors.map((gc) => (
                      <SelectItem key={gc.id} value={gc.name}>{gc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Superintendent</label>
                <Select value={editFormData.superintendent} onValueChange={(value) => setEditFormData(prev => ({ ...prev, superintendent: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select superintendent" />
                  </SelectTrigger>
                  <SelectContent>
                    {superintendents.map((superintendent) => (
                      <SelectItem key={superintendent.id} value={superintendent.name}>{superintendent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Project Manager</label>
                <Select value={editFormData.projectManager} onValueChange={(value) => setEditFormData(prev => ({ ...prev, projectManager: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select project manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectManagers.map((pm) => (
                      <SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Address</label>
                <Input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter job address"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Lockbox Code</label>
                <Input
                  value={editFormData.lockboxCode}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, lockboxCode: e.target.value }))}
                  placeholder="Enter lockbox code"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default JobHeader;
