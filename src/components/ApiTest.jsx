import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import apiService from '../services/apiService';
import { useJobs } from '../hooks/useApiData';

const ApiTest = () => {
  const [testJobName, setTestJobName] = useState('Test Job from API');
  const [testJobAddress, setTestJobAddress] = useState('123 Test Street');
  const [testEmployeeName, setTestEmployeeName] = useState('John Doe');
  const [testEmployeePosition, setTestEmployeePosition] = useState('Drywall Installer');
  const [testEmployeePayRate, setTestEmployeePayRate] = useState('25.00');
  const [apiStatus, setApiStatus] = useState('unknown');
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await apiService.healthCheck();
      setApiStatus('connected');
      toast({
        title: "API Connected!",
        description: response.message,
      });
    } catch (error) {
      setApiStatus('disconnected');
      toast({
        title: "API Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Test creating a job via API
  const testCreateJob = async () => {
    try {
      const newJob = {
        name: testJobName,
        address: testJobAddress,
        status: 'estimating',
        type: 'residential',
        startDate: new Date().toISOString(),
        estimate: 0,
        actual: 0,
        scopes: [],
        takeoffPhases: [],
        checklists: [],
        documents: [],
        dailyLogs: []
      };

      const createdJob = await apiService.createJob(newJob);
      toast({
        title: "Job Created!",
        description: `Job "${createdJob.name}" created successfully via API`,
      });
      
      // Refresh jobs list
      loadJobs();
    } catch (error) {
      toast({
        title: "Failed to Create Job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Test creating an employee via API
  const testCreateEmployee = async () => {
    try {
      const newEmployee = {
        firstName: testEmployeeName.split(' ')[0] || testEmployeeName,
        lastName: testEmployeeName.split(' ')[1] || '',
        position: testEmployeePosition,
        payRate: parseFloat(testEmployeePayRate),
        status: 'active',
        hireDate: new Date().toISOString(),
        phone: '',
        email: '',
        address: '',
        documents: [],
        onboarding: {
          completed: false,
          steps: []
        }
      };

      const createdEmployee = await apiService.createEmployee(newEmployee);
      toast({
        title: "Employee Created!",
        description: `Employee "${createdEmployee.firstName} ${createdEmployee.lastName}" created successfully via API`,
      });
      
      // Refresh employees list
      loadEmployees();
    } catch (error) {
      toast({
        title: "Failed to Create Employee",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load jobs from API
  const loadJobs = async () => {
    try {
      const jobsData = await apiService.getJobs();
      setJobs(jobsData);
    } catch (error) {
      toast({
        title: "Failed to Load Jobs",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load employees from API
  const loadEmployees = async () => {
    try {
      const employeesData = await apiService.getEmployees();
      setEmployees(employeesData);
    } catch (error) {
      toast({
        title: "Failed to Load Employees",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Test data summary
  const testDataSummary = async () => {
    try {
      const summary = await apiService.getDataSummary();
      toast({
        title: "Data Summary",
        description: `Jobs: ${summary.jobs}, Employees: ${summary.employees}, Time Entries: ${summary.timeEntries}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Get Summary",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔌 API Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={testApiConnection}>
              Test API Connection
            </Button>
            <span className={`px-3 py-1 rounded-full text-sm ${
              apiStatus === 'connected' ? 'bg-green-100 text-green-800' :
              apiStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Status: {apiStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Test Job Name</Label>
              <Input
                id="jobName"
                value={testJobName}
                onChange={(e) => setTestJobName(e.target.value)}
                placeholder="Enter job name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobAddress">Test Job Address</Label>
              <Input
                id="jobAddress"
                value={testJobAddress}
                onChange={(e) => setTestJobAddress(e.target.value)}
                placeholder="Enter job address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Test Employee Name</Label>
              <Input
                id="employeeName"
                value={testEmployeeName}
                onChange={(e) => setTestEmployeeName(e.target.value)}
                placeholder="Enter employee name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                value={testEmployeePosition}
                onChange={(e) => setTestEmployeePosition(e.target.value)}
                placeholder="Enter position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeePayRate">Pay Rate ($/hr)</Label>
              <Input
                id="employeePayRate"
                value={testEmployeePayRate}
                onChange={(e) => setTestEmployeePayRate(e.target.value)}
                placeholder="Enter pay rate"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testCreateJob}>
              Create Test Job via API
            </Button>
            <Button onClick={testCreateEmployee}>
              Create Test Employee via API
            </Button>
            <Button onClick={loadJobs} variant="outline">
              Load Jobs from API
            </Button>
            <Button onClick={loadEmployees} variant="outline">
              Load Employees from API
            </Button>
            <Button onClick={testDataSummary} variant="outline">
              Get Data Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Jobs from API ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{job.name}</div>
                  <div className="text-sm text-gray-600">{job.address}</div>
                  <div className="text-xs text-gray-500">
                    Status: {job.status} | Created: {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>👥 Employees from API ({employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                  <div className="text-sm text-gray-600">{employee.position}</div>
                  <div className="text-xs text-gray-500">
                    Pay Rate: ${employee.payRate}/hr | Status: {employee.status} | Hired: {new Date(employee.hireDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📚 How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>Test API Connection</strong> - Verifies the backend is running</p>
          <p>2. <strong>Create Test Job</strong> - Creates a job via the API instead of localStorage</p>
          <p>3. <strong>Create Test Employee</strong> - Creates an employee via the API</p>
          <p>4. <strong>Load Jobs/Employees</strong> - Fetches all data from the API</p>
          <p>5. <strong>Get Data Summary</strong> - Shows counts of all data types</p>
          <p className="text-gray-600 mt-4">
            This demonstrates how your app can now use the API instead of localStorage. 
            The API status indicator in the header shows the real-time connection status.
            Created employees will also appear in your HR/Labor Management sections.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;
