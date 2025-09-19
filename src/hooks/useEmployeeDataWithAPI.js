import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { storage, STORAGE_KEYS, generateId, testData } from '@/lib/utils';
import apiService from '../services/apiService';

// Create test employees with enhanced payroll fields
const createTestEmployees = () => {
  return testData.generateEmployees();
};

export function useEmployeeDataWithAPI(useAPI = true) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employees from API or localStorage
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      if (useAPI) {
        // Try to load from API first
        const apiEmployees = await apiService.getEmployees();
        setEmployees(apiEmployees);
        console.log('Loaded employees from API:', apiEmployees);
      } else {
        // Fallback to localStorage
        let savedEmployees = storage.load(STORAGE_KEYS.EMPLOYEES, [], 'employees');
        
        // Add test employees if none exist
        if (savedEmployees.length === 0) {
          savedEmployees = createTestEmployees();
          storage.save(STORAGE_KEYS.EMPLOYEES, savedEmployees, 'employees');
        }
        
        setEmployees(savedEmployees);
        console.log('Loaded employees from localStorage:', savedEmployees);
      }
    } catch (error) {
      console.error('Failed to load employees from API, falling back to localStorage:', error);
      // Fallback to localStorage if API fails
      let savedEmployees = storage.load(STORAGE_KEYS.EMPLOYEES, [], 'employees');
      if (savedEmployees.length === 0) {
        savedEmployees = createTestEmployees();
        storage.save(STORAGE_KEYS.EMPLOYEES, savedEmployees, 'employees');
      }
      setEmployees(savedEmployees);
    } finally {
      setLoading(false);
    }
  }, [useAPI]);

  // Load employees on mount and when useAPI changes
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Add employee
  const addEmployee = useCallback(async (employeeData) => {
    const newEmployee = {
      id: generateId(),
      ...employeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (useAPI) {
        // Save to API
        const createdEmployee = await apiService.createEmployee(newEmployee);
        setEmployees(prev => [...prev, createdEmployee]);
        toast({
          title: "Employee Added",
          description: `${createdEmployee.firstName} ${createdEmployee.lastName} has been added.`,
        });
      } else {
        // Save to localStorage
        const updatedEmployees = [...employees, newEmployee];
        setEmployees(updatedEmployees);
        storage.save(STORAGE_KEYS.EMPLOYEES, updatedEmployees, 'employees');
        toast({
          title: "Employee Added",
          description: `${newEmployee.firstName} ${newEmployee.lastName} has been added.`,
        });
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  }, [employees, useAPI]);

  // Update employee
  const updateEmployee = useCallback(async (id, updates) => {
    try {
      if (useAPI) {
        // Update via API
        const updatedEmployee = await apiService.updateEmployee(id, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
        toast({
          title: "Employee Updated",
          description: "Employee information has been updated.",
        });
      } else {
        // Update in localStorage
        const updatedEmployees = employees.map(emp => 
          emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString() } : emp
        );
        setEmployees(updatedEmployees);
        storage.save(STORAGE_KEYS.EMPLOYEES, updatedEmployees, 'employees');
        toast({
          title: "Employee Updated",
          description: "Employee information has been updated.",
        });
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      });
    }
  }, [employees, useAPI]);

  // Delete employee
  const deleteEmployee = useCallback(async (id) => {
    try {
      if (useAPI) {
        // Delete via API
        await apiService.deleteEmployee(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        toast({
          title: "Employee Deleted",
          description: "Employee has been removed.",
        });
      } else {
        // Delete from localStorage
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        setEmployees(updatedEmployees);
        storage.save(STORAGE_KEYS.EMPLOYEES, updatedEmployees, 'employees');
        toast({
          title: "Employee Deleted",
          description: "Employee has been removed.",
        });
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    }
  }, [employees, useAPI]);

  // Add tool deduction
  const addToolDeduction = useCallback(async (employeeId, deduction) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const newDeduction = {
      id: generateId(),
      ...deduction,
      date: new Date().toISOString(),
    };

    const updatedDeductions = [...(employee.toolDeductions || []), newDeduction];
    await updateEmployee(employeeId, { toolDeductions: updatedDeductions });
  }, [employees, updateEmployee]);

  // Remove tool deduction
  const removeToolDeduction = useCallback(async (employeeId, deductionId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const updatedDeductions = (employee.toolDeductions || []).filter(d => d.id !== deductionId);
    await updateEmployee(employeeId, { toolDeductions: updatedDeductions });
  }, [employees, updateEmployee]);

  // Bank hours
  const bankHours = useCallback(async (employeeId, hours) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const newBankedHours = (employee.bankedHours || 0) + hours;
    await updateEmployee(employeeId, { bankedHours: newBankedHours });
  }, [employees, updateEmployee]);

  // Use banked hours
  const useBankedHours = useCallback(async (employeeId, hours) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const newBankedHours = Math.max(0, (employee.bankedHours || 0) - hours);
    await updateEmployee(employeeId, { bankedHours: newBankedHours });
  }, [employees, updateEmployee]);

  // Update employee tool deductions
  const updateEmployeeToolDeductions = useCallback(async (employeeId, deductions) => {
    await updateEmployee(employeeId, { toolDeductions: deductions });
  }, [updateEmployee]);

  // Add employee document
  const addEmployeeDocument = useCallback(async (employeeId, document) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const newDocument = {
      id: generateId(),
      ...document,
      uploadedAt: new Date().toISOString(),
    };

    const updatedDocuments = [...(employee.documents || []), newDocument];
    await updateEmployee(employeeId, { documents: updatedDocuments });
  }, [employees, updateEmployee]);

  // Remove employee document
  const removeEmployeeDocument = useCallback(async (employeeId, documentId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const updatedDocuments = (employee.documents || []).filter(d => d.id !== documentId);
    await updateEmployee(employeeId, { documents: updatedDocuments });
  }, [employees, updateEmployee]);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addToolDeduction,
    removeToolDeduction,
    bankHours,
    useBankedHours,
    updateEmployeeToolDeductions,
    addEmployeeDocument,
    removeEmployeeDocument,
    refreshEmployees: loadEmployees,
  };
}

