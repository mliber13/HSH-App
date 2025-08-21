import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  FileText, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  UserCheck,
  Mail,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import OnboardingForm from './OnboardingForm';
import OnboardingStatus from './OnboardingStatus';
import { toast } from '@/components/ui/use-toast';

const OnboardingDashboard = ({ employees, updateEmployee }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [showStatusView, setShowStatusView] = useState(false);

  // Calculate onboarding statistics
  const onboardingStats = useMemo(() => {
    const total = employees.length;
    const pending = employees.filter(emp => emp.onboardingStatus === 'pending').length;
    const inProgress = employees.filter(emp => emp.onboardingStatus === 'in_progress').length;
    const completed = employees.filter(emp => emp.onboardingStatus === 'completed').length;
    const overdue = employees.filter(emp => {
      if (emp.onboardingStatus === 'pending' || emp.onboardingStatus === 'in_progress') {
        const startDate = new Date(emp.onboardingStartDate || emp.createdAt);
        const daysSince = (new Date() - startDate) / (1000 * 60 * 60 * 24);
        return daysSince > 7; // Overdue after 7 days
      }
      return false;
    }).length;

    return { total, pending, inProgress, completed, overdue };
  }, [employees]);

  // Get employees by onboarding status
  const employeesByStatus = useMemo(() => {
    return {
      pending: employees.filter(emp => emp.onboardingStatus === 'pending'),
      inProgress: employees.filter(emp => emp.onboardingStatus === 'in_progress'),
      completed: employees.filter(emp => emp.onboardingStatus === 'completed'),
      notStarted: employees.filter(emp => !emp.onboardingStatus)
    };
  }, [employees]);

  const handleStartOnboarding = (employee) => {
    setSelectedEmployee(employee);
    setShowOnboardingForm(true);
  };

  const handleViewStatus = (employee) => {
    setSelectedEmployee(employee);
    setShowStatusView(true);
  };

  const handleSendOnboarding = (employeeId, onboardingData) => {
    const updatedEmployee = employees.find(emp => emp.id === employeeId);
    if (updatedEmployee) {
      const onboardingInfo = {
        ...updatedEmployee,
        onboardingStatus: 'in_progress',
        onboardingStartDate: new Date().toISOString(),
        onboardingData: {
          ...onboardingData,
          sentDate: new Date().toISOString(),
          documents: onboardingData.documents.map(doc => ({
            ...doc,
            status: 'sent',
            sentDate: new Date().toISOString()
          }))
        }
      };
      
      updateEmployee(employeeId, onboardingInfo);
      setShowOnboardingForm(false);
      setSelectedEmployee(null);
      
      toast({
        title: "Onboarding Initiated",
        description: `Onboarding paperwork has been sent to ${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
      });
    }
  };

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
      default: return <UserPlus className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{onboardingStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{onboardingStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{onboardingStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{onboardingStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{onboardingStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            Employee Onboarding Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending ({employeesByStatus.pending.length})</TabsTrigger>
              <TabsTrigger value="inProgress">In Progress ({employeesByStatus.inProgress.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({employeesByStatus.completed.length})</TabsTrigger>
              <TabsTrigger value="notStarted">Not Started ({employeesByStatus.notStarted.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {employeesByStatus.pending.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending onboarding requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeesByStatus.pending.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-gray-600">{employee.employeeType} • {employee.role}</p>
                          </div>
                          <Badge className={getStatusColor(employee.onboardingStatus)}>
                            {getStatusIcon(employee.onboardingStatus)}
                            <span className="ml-1">Pending</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Started {new Date(employee.onboardingStartDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleViewStatus(employee)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Status
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartOnboarding(employee)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inProgress" className="space-y-4">
              {employeesByStatus.inProgress.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No onboarding in progress</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeesByStatus.inProgress.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-gray-600">{employee.employeeType} • {employee.role}</p>
                          </div>
                          <Badge className={getStatusColor(employee.onboardingStatus)}>
                            {getStatusIcon(employee.onboardingStatus)}
                            <span className="ml-1">In Progress</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Started {new Date(employee.onboardingStartDate).toLocaleDateString()}</span>
                          </div>
                          {employee.onboardingData && (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>{employee.onboardingData.documents?.length || 0} documents sent</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleViewStatus(employee)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Progress
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {employeesByStatus.completed.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed onboarding</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeesByStatus.completed.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-gray-600">{employee.employeeType} • {employee.role}</p>
                          </div>
                          <Badge className={getStatusColor(employee.onboardingStatus)}>
                            {getStatusIcon(employee.onboardingStatus)}
                            <span className="ml-1">Completed</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Completed {new Date(employee.onboardingCompletedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleViewStatus(employee)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Documents
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notStarted" className="space-y-4">
              {employeesByStatus.notStarted.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>All employees have onboarding initiated</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeesByStatus.notStarted.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                            <p className="text-sm text-gray-600">{employee.employeeType} • {employee.role}</p>
                          </div>
                          <Badge className={getStatusColor(employee.onboardingStatus)}>
                            {getStatusIcon(employee.onboardingStatus)}
                            <span className="ml-1">Not Started</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Added {new Date(employee.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleStartOnboarding(employee)}
                            className="flex-1"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Start Onboarding
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Onboarding Form Modal */}
      {showOnboardingForm && selectedEmployee && (
        <OnboardingForm
          employee={selectedEmployee}
          onSend={handleSendOnboarding}
          onCancel={() => {
            setShowOnboardingForm(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Status View Modal */}
      {showStatusView && selectedEmployee && (
        <OnboardingStatus
          employee={selectedEmployee}
          onClose={() => {
            setShowStatusView(false);
            setSelectedEmployee(null);
          }}
          onUpdateStatus={(status) => {
            const updatedEmployee = {
              ...selectedEmployee,
              onboardingStatus: status,
              onboardingCompletedDate: status === 'completed' ? new Date().toISOString() : undefined
            };
            updateEmployee(selectedEmployee.id, updatedEmployee);
            setShowStatusView(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingDashboard;
