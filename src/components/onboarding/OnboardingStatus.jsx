import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  FileText, 
  User, 
  Mail, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  X,
  Send,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const OnboardingStatus = ({ employee, onClose, onUpdateStatus }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const onboardingData = employee.onboardingData || {};
  const documents = onboardingData.documents || [];

  // Calculate completion statistics
  const totalDocuments = documents.length;
  const completedDocuments = documents.filter(doc => doc.status === 'completed').length;
  const pendingDocuments = documents.filter(doc => doc.status === 'pending').length;
  const inProgressDocuments = documents.filter(doc => doc.status === 'in_progress').length;
  const completionPercentage = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;

  // Check if overdue
  const isOverdue = onboardingData.dueDate && new Date(onboardingData.dueDate) < new Date();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  const handleDocumentStatusUpdate = (documentId, newStatus) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === documentId ? { ...doc, status: newStatus } : doc
    );

    const updatedOnboardingData = {
      ...onboardingData,
      documents: updatedDocuments
    };

    const updatedEmployee = {
      ...employee,
      onboardingData: updatedOnboardingData
    };

    // Check if all documents are completed
    const allCompleted = updatedDocuments.every(doc => doc.status === 'completed');
    if (allCompleted && employee.onboardingStatus !== 'completed') {
      onUpdateStatus('completed');
    } else if (!allCompleted && employee.onboardingStatus === 'completed') {
      onUpdateStatus('in_progress');
    }

    toast({
      title: "Status Updated",
      description: `Document status updated to ${newStatus}`,
    });
  };

  const handleMarkAllComplete = () => {
    const updatedDocuments = documents.map(doc => ({
      ...doc,
      status: 'completed',
      completedDate: new Date().toISOString()
    }));

    const updatedOnboardingData = {
      ...onboardingData,
      documents: updatedDocuments
    };

    const updatedEmployee = {
      ...employee,
      onboardingData: updatedOnboardingData
    };

    onUpdateStatus('completed');
    toast({
      title: "All Documents Completed",
      description: "All onboarding documents have been marked as completed",
    });
  };

  const handleResendDocuments = () => {
    toast({
      title: "Documents Resent",
      description: `Onboarding documents have been resent to ${employee.firstName} ${employee.lastName}`,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Onboarding Status - {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-lg font-semibold">{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <Badge className="mt-1">
                    {employee.employeeType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{employee.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <p>{employee.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Progress</p>
                  <p className="text-2xl font-bold">{completionPercentage.toFixed(0)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-lg font-semibold">{completedDocuments} / {totalDocuments}</p>
                </div>
              </div>
              
              <Progress value={completionPercentage} className="w-full" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{completedDocuments}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{inProgressDocuments}</p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{pendingDocuments}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>

              {/* Due Date Warning */}
              {isOverdue && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Onboarding Overdue</p>
                      <p className="text-sm text-red-600">
                        Due date was {new Date(onboardingData.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Due Date Info */}
              {onboardingData.dueDate && !isOverdue && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Due Date</p>
                      <p className="text-sm text-blue-600">
                        {new Date(onboardingData.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Document Status
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResendDocuments}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Resend
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleMarkAllComplete}
                    disabled={completedDocuments === totalDocuments}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Mark All Complete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No onboarding documents found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-600">{doc.description}</p>
                          {doc.completedDate && (
                            <p className="text-xs text-gray-500">
                              Completed: {new Date(doc.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status === 'completed' ? 'Completed' : 
                           doc.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </Badge>
                        
                        {doc.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentStatusUpdate(doc.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                        
                        {doc.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentStatusUpdate(doc.id, 'in_progress')}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Onboarding Message */}
          {onboardingData.message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Onboarding Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{onboardingData.message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onboardingData.sentDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Onboarding Initiated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(onboardingData.sentDate).toLocaleDateString()} at {new Date(onboardingData.sentDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {onboardingData.dueDate && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(onboardingData.dueDate).toLocaleDateString()}
                        {isOverdue && <span className="text-red-600 ml-2">(Overdue)</span>}
                      </p>
                    </div>
                  </div>
                )}
                
                {employee.onboardingCompletedDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Onboarding Completed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(employee.onboardingCompletedDate).toLocaleDateString()} at {new Date(employee.onboardingCompletedDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          {completedDocuments === totalDocuments && totalDocuments > 0 && (
            <Button 
              onClick={() => onUpdateStatus('completed')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Onboarding
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingStatus;
