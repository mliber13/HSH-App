import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, UserCheck, FileText, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmployeeManagement from '@/components/EmployeeManagement';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import OnboardingDashboard from '@/components/onboarding/OnboardingDashboard';

const LaborManagement = ({ 
  employees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee, 
  addToolDeduction, 
  removeToolDeduction, 
  bankHours, 
  useBankedHours, 
  updateEmployeeToolDeductions,
  addEmployeeDocument,
  removeEmployeeDocument
}) => {
  const [currentView, setCurrentView] = useState('employees');
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  console.log('LaborManagement rendering with employees:', employees);

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
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Labor Management</CardTitle>
                  <p className="text-white/80 mt-1">Employee & Contractor Management</p>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Total Labor</p>
                <p className="font-semibold text-2xl">{employees.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserCheck className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">Employees</p>
                <p className="font-semibold text-2xl">{employees.filter(emp => emp.employeeType === 'Employee').length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-white/70 text-sm">1099 Contractors</p>
                <p className="font-semibold text-2xl">{employees.filter(emp => emp.employeeType === '1099 Contractor').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setCurrentView('employees')}
          variant={currentView === 'employees' ? 'default' : 'outline'}
          className={currentView === 'employees' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <Users className="h-4 w-4 mr-2" />
          All Labor
        </Button>
        <Button
          onClick={() => setCurrentView('employees-only')}
          variant={currentView === 'employees-only' ? 'default' : 'outline'}
          className={currentView === 'employees-only' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Employees Only
        </Button>
        <Button
          onClick={() => setCurrentView('contractors')}
          variant={currentView === 'contractors' ? 'default' : 'outline'}
          className={currentView === 'contractors' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <FileText className="h-4 w-4 mr-2" />
          1099 Contractors
        </Button>
        <Button
          onClick={() => setCurrentView('onboarding')}
          variant={currentView === 'onboarding' ? 'default' : 'outline'}
          className={currentView === 'onboarding' ? 'bg-gradient-to-r from-brandPrimary to-brandSecondary text-white' : ''}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Onboarding
        </Button>
      </div>

      {currentView === 'onboarding' ? (
        <OnboardingDashboard 
          employees={employees}
          updateEmployee={updateEmployee}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Labor Management</h2>
            <Button
              onClick={() => setShowAddEmployee(true)}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Labor
            </Button>
          </div>
          <EmployeeManagement 
            employees={employees}
            updateEmployee={updateEmployee}
            deleteEmployee={deleteEmployee}
            addToolDeduction={addToolDeduction}
            removeToolDeduction={removeToolDeduction}
            bankHours={bankHours}
            useBankedHours={useBankedHours}
            addEmployeeDocument={addEmployeeDocument}
            removeEmployeeDocument={removeEmployeeDocument}
            filterType={currentView === 'employees-only' ? 'Employee' : currentView === 'contractors' ? '1099 Contractor' : 'all'}
          />
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployeeForm
          onSubmit={(employeeData) => {
            console.log("AddEmployeeForm onSubmit callback triggered in LaborManagement");
            addEmployee(employeeData);
            setShowAddEmployee(false);
          }}
          onCancel={() => {
            console.log("AddEmployeeForm onCancel callback triggered in LaborManagement");
            setShowAddEmployee(false);
          }}
        />
      )}
    </div>
  );
};

export default LaborManagement;
