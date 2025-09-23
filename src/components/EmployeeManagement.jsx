import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, Trash2, DollarSign, Clock, Calendar, Calculator, Wrench, Banknote, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTimeClock } from '@/hooks/useTimeClock';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import EmployeeDocuments from '@/components/EmployeeDocuments';

const EmployeeManagement = ({ 
  employees, 
  updateEmployee, 
  deleteEmployee, 
  addToolDeduction, 
  removeToolDeduction, 
  bankHours, 
  useBankedHours,
  addEmployeeDocument,
  removeEmployeeDocument,
  filterType = 'all'
}) => {
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingDocuments, setViewingDocuments] = useState(null);
  
  // Update viewingDocuments when employee data changes
  useEffect(() => {
    if (viewingDocuments) {
      const updatedEmployee = employees.find(emp => emp.id === viewingDocuments.id);
      if (updatedEmployee) {
        setViewingDocuments(updatedEmployee);
      }
    }
  }, [employees, viewingDocuments]);
  
  const { 
    getEmployeeActiveEntry,
    getEmployeeActivePieceRateEntry,
    getTotalHoursForEmployee,
    getTotalEarningsForEmployee
  } = useTimeClock();

  const handleDeleteEmployee = (employeeId) => {
    deleteEmployee(employeeId);
  };

  const getEmployeeTypeColor = (type) => {
    switch (type) {
      case 'Employee':
        return 'bg-brandSecondary/10 text-brandSecondary';
      case '1099 Contractor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Hanger':
        return 'bg-brandPrimary/10 text-brandPrimary';
      case 'Finisher':
        return 'bg-purple-100 text-purple-800';
      case 'Laborer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPayTypeColor = (payType) => {
    switch (payType) {
      case 'salary':
        return 'bg-green-100 text-green-800';
      case 'hourly':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">No employees added yet</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Employee" to get started</p>
        </CardContent>
      </Card>
    );
  }

  // Filter employees based on filterType
  const filteredEmployees = employees.filter(employee => {
    if (filterType === 'all') return true;
    // Handle employee type filtering
    return employee.employeeType === filterType;
  });

  if (filteredEmployees.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            {filterType === 'all' ? 'No employees added yet' : `No ${filterType}s found`}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {filterType === 'all' ? 'Click "Add Labor" to get started' : `No ${filterType}s match the current filter`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee, index) => {
          const activeEntry = getEmployeeActiveEntry(employee.id);
          const activePieceRateEntry = getEmployeeActivePieceRateEntry(employee.id);
          const isWorking = !!(activeEntry || activePieceRateEntry);
          const totalHours = getTotalHoursForEmployee(employee.id);
          const totalEarnings = getTotalEarningsForEmployee(employee.id);

          return (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 ${
                isWorking ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isWorking ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <User className={`h-5 w-5 ${
                          isWorking ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                          <Badge className={getEmployeeTypeColor(employee.employeeType)}>
                            {employee.employeeType}
                          </Badge>
                          <Badge className={getRoleColor(employee.role)}>
                            {employee.role}
                          </Badge>
                          <Badge className={getPayTypeColor(employee.payType)}>
                            {employee.payType === 'salary' ? 'Salary' : 'Hourly'}
                          </Badge>
                          {isWorking && (
                            <Badge className="bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                              {activeEntry ? 'Hourly' : 'Piece Rate'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setViewingDocuments(employee)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        title="View Documents"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Docs
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEmployee(employee)}
                        className="text-brandSecondary hover:bg-brandSecondary/10"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {employee.firstName} {employee.lastName}? 
                              This action cannot be undone and will remove all associated time entries.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Employee
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Pay Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-gray-600">
                          {employee.payType === 'salary' ? 'Weekly Salary' : 'Hourly Rate'}
                        </p>
                        <p className="font-semibold">
                          {employee.payType === 'salary' 
                            ? `$${employee.salaryAmount}` 
                            : `$${employee.hourlyRate}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-brandSecondary" />
                      <div>
                        <p className="text-gray-600">Total Hours</p>
                        <p className="font-semibold">{totalHours.toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>

                  {/* Piece Rate Earnings */}
                  {employee.role !== 'Laborer' && totalEarnings > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calculator className="h-4 w-4 text-brandPrimary" />
                      <div>
                        <p className="text-gray-600">Piece Rate Earnings</p>
                        <p className="font-semibold text-green-600">${totalEarnings.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {/* Banked Hours */}
                  {(employee.bankedHours || 0) > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Banknote className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-gray-600">Banked Hours</p>
                        <p className="font-semibold text-purple-600">{employee.bankedHours} hours</p>
                      </div>
                    </div>
                  )}

                  {/* Allowances */}
                  {((employee.perDiem || 0) > 0 || (employee.fuelAllowance || 0) > 0) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {(employee.perDiem || 0) > 0 && (
                        <div>
                          <p className="text-gray-600">Per Diem</p>
                          <p className="font-medium">${employee.perDiem}/day</p>
                        </div>
                      )}
                      {(employee.fuelAllowance || 0) > 0 && (
                        <div>
                          <p className="text-gray-600">Fuel Allowance</p>
                          <p className="font-medium">${employee.fuelAllowance}/week</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool Deductions */}
                  {(employee.toolDeductions || []).length > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Wrench className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-gray-600">Tool Deductions</p>
                        <p className="font-medium text-red-600">
                          {employee.toolDeductions.length} active 
                          {employee.toolDeductions.length > 0 && (
                            <span className="ml-1">
                              (${employee.toolDeductions.reduce((sum, tool) => sum + (tool.weeklyDeduction || 0), 0)}/week)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {employee.email && (
                    <div className="text-sm">
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                  )}

                  {employee.phone && (
                    <div className="text-sm">
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>Added {formatDate(employee.createdAt)}</span>
                    </div>
                    {(employee.documents || []).length > 0 && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{employee.documents.length} document{(employee.documents || []).length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          updateEmployee={updateEmployee}
          addToolDeduction={addToolDeduction}
          removeToolDeduction={removeToolDeduction}
          bankHours={bankHours}
          useBankedHours={useBankedHours}
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
        />
      )}

      {viewingDocuments && (
        <EmployeeDocuments
          employee={viewingDocuments}
          documents={viewingDocuments.documents || []}
          onUploadDocument={addEmployeeDocument}
          onDeleteDocument={removeEmployeeDocument}
          onClose={() => setViewingDocuments(null)}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;