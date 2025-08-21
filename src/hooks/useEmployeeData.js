import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { storage, STORAGE_KEYS, generateId, testData } from '@/lib/utils';

// Create test employees with enhanced payroll fields
const createTestEmployees = () => {
  return testData.generateEmployees();
};

export function useEmployeeData() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employees from localStorage on mount
  useEffect(() => {
    console.log('=== useEmployeeData: Initial useEffect started ===');
    
    let savedEmployees = storage.load(STORAGE_KEYS.EMPLOYEES, [], 'employees');
    console.log('useEmployeeData: Loaded employees from storage (raw):', savedEmployees);
    
    // Add test employees if none exist or update existing ones with new fields
    if (savedEmployees.length === 0) {
      console.log('useEmployeeData: No employees found, creating test employees.');
      savedEmployees = createTestEmployees();
      storage.save(STORAGE_KEYS.EMPLOYEES, savedEmployees, 'employees');
    } else {
      console.log('useEmployeeData: Existing employees found, updating fields.');
      // Update existing employees with new payroll fields if they don't exist
      savedEmployees = savedEmployees.map(emp => {
        const updatedEmp = { ...emp };
        
        // Only add defaults for truly missing or invalid fields
        if (!updatedEmp.payType || (updatedEmp.payType !== 'hourly' && updatedEmp.payType !== 'salary')) {
          updatedEmp.payType = 'hourly';
        }
        
        if (typeof updatedEmp.salaryAmount !== 'number' || isNaN(updatedEmp.salaryAmount)) {
          updatedEmp.salaryAmount = 0;
        }
        
        if (typeof updatedEmp.hourlyRate !== 'number' || isNaN(updatedEmp.hourlyRate)) {
          updatedEmp.hourlyRate = updatedEmp.hourlyRate || 0;
        }
        
        if (typeof updatedEmp.bankedHours !== 'number' || isNaN(updatedEmp.bankedHours)) {
          updatedEmp.bankedHours = 0;
        }
        
        if (typeof updatedEmp.perDiem !== 'number' || isNaN(updatedEmp.perDiem)) {
          updatedEmp.perDiem = 0;
        }
        
        if (typeof updatedEmp.fuelAllowance !== 'number' || isNaN(updatedEmp.fuelAllowance)) {
          updatedEmp.fuelAllowance = 0;
        }
        
        if (!Array.isArray(updatedEmp.toolDeductions)) {
          updatedEmp.toolDeductions = [];
        }
        
        if (!Array.isArray(updatedEmp.documents)) {
          updatedEmp.documents = [];
        }
        
        // Add onboarding fields if they don't exist
        if (!updatedEmp.onboardingStatus) {
          updatedEmp.onboardingStatus = null;
        }
        
        if (!updatedEmp.onboardingStartDate) {
          updatedEmp.onboardingStartDate = null;
        }
        
        if (!updatedEmp.onboardingCompletedDate) {
          updatedEmp.onboardingCompletedDate = null;
        }
        
        if (!updatedEmp.onboardingData) {
          updatedEmp.onboardingData = null;
        }
        
        if (typeof updatedEmp.childSupportDeduction !== 'number' || isNaN(updatedEmp.childSupportDeduction)) {
          updatedEmp.childSupportDeduction = 0;
        }
        
        if (typeof updatedEmp.miscDeduction !== 'number' || isNaN(updatedEmp.miscDeduction)) {
          updatedEmp.miscDeduction = 0;
        }
        
        if (typeof updatedEmp.miscDeductionNote !== 'string') {
          updatedEmp.miscDeductionNote = '';
        }
        
        return updatedEmp;
      });
      storage.save(STORAGE_KEYS.EMPLOYEES, savedEmployees, 'employees');
    }
    
    console.log('useEmployeeData: Final employees array before setting state:', savedEmployees);
    setEmployees(savedEmployees);
    setLoading(false);
    
    console.log('useEmployeeData: Initial useEffect finished. Loading set to false.');
  }, []);

  // Save employees to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      console.log('=== EMPLOYEES USEEFFECT TRIGGERED ===');
      console.log('Loading state:', loading);
      console.log('Employees array length:', employees.length);
      console.log('Employees data:', employees);
      console.log('About to save employees to localStorage...');
      storage.save(STORAGE_KEYS.EMPLOYEES, employees, 'employees');
      console.log('=== END EMPLOYEES USEEFFECT ===');
    }
  }, [employees, loading]);

  const addEmployee = (employeeData, callback) => {
    console.log("addEmployee called with data:", employeeData);
    
    const newEmployee = {
      id: generateId(),
      ...employeeData,
      payType: employeeData.payType || 'hourly',
      salaryAmount: employeeData.payType === 'salary' ? parseFloat(employeeData.salaryAmount) || 0 : 0,
      hourlyRate: employeeData.payType === 'hourly' ? parseFloat(employeeData.hourlyRate) || 0 : 0,
      bankedHours: 0,
      perDiem: parseFloat(employeeData.perDiem) || 0,
      fuelAllowance: parseFloat(employeeData.fuelAllowance) || 0,
      toolDeductions: [],
      documents: [],
      childSupportDeduction: 0,
      miscDeduction: 0,
      miscDeductionNote: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("Created new employee object:", newEmployee);
    
    setEmployees(prev => {
      console.log('Inside setEmployees callback. Previous state (prev):', prev);
      console.log('Previous state length (prev.length):', prev.length);

      const updatedEmployees = [...prev, newEmployee];
      console.log("Updated employees array:", updatedEmployees);
      
      return updatedEmployees;
    });
    
    toast({
      title: "Employee Added! 👷",
      description: `${employeeData.firstName} ${employeeData.lastName} has been added to the system.`
    });
    
    if (callback) {
      console.log("Calling callback function");
      callback();
    }
  };

  const updateEmployee = (employeeId, updates, callback) => {
    console.log('=== UPDATE EMPLOYEE FUNCTION CALLED ===');
    console.log('Employee ID:', employeeId);
    console.log('Updates:', updates);
    
    setEmployees(prev => {
      console.log('Inside setEmployees callback. Previous state (prev):', prev);
      console.log('Previous state length (prev.length):', prev.length);

      const updatedEmployees = prev.map(employee =>
        employee.id === employeeId
          ? { ...employee, ...updates, updatedAt: new Date().toISOString() }
          : employee
      );
      console.log('Updated employees array (after map):', updatedEmployees);
      console.log('Updated employees array length:', updatedEmployees.length);

      return updatedEmployees;
    });
    
    console.log('setEmployees called, state should update now');
    
    // Check state after it's potentially updated by React
    setTimeout(() => {
      console.log('--- State after setEmployees (via setTimeout) ---');
      console.log('Current employees state:', employees);
      console.log('Current employees state length:', employees.length);
    }, 500);

    toast({
      title: "Employee Updated! ✨",
      description: "Employee information has been updated successfully."
    });
    
    console.log('About to call callback if provided');
    if (callback) callback(employeeId, updates);
    console.log('=== END UPDATE EMPLOYEE FUNCTION ===');
  };

  const deleteEmployee = useCallback((employeeId, callback) => {
    setEmployees(prev => prev.filter(employee => employee.id !== employeeId));
    toast({
      title: "Employee Removed! 🗑️",
      description: "The employee has been removed from the system.",
      variant: "destructive"
    });
    if (callback) callback(employeeId);
  }, []);

  // Add tool deduction to employee
  const addToolDeduction = useCallback((employeeId, toolData, callback) => {
    const newToolDeduction = {
      id: generateId(),
      description: toolData.description,
      totalAmount: parseFloat(toolData.totalAmount),
      weeklyDeduction: parseFloat(toolData.weeklyDeduction),
      remainingBalance: parseFloat(toolData.totalAmount),
      startDate: new Date().toISOString()
    };

    setEmployees(prev => prev.map(employee => 
      employee.id === employeeId 
        ? { 
            ...employee, 
            toolDeductions: [...(employee.toolDeductions || []), newToolDeduction],
            updatedAt: new Date().toISOString() 
          }
        : employee
    ));

    toast({
      title: "Tool Deduction Added! 🔧",
      description: `${toolData.description} deduction of $${toolData.weeklyDeduction}/week added.`
    });
    if (callback) callback();
  }, []);

  // Remove tool deduction
  const removeToolDeduction = useCallback((employeeId, toolId, callback) => {
    setEmployees(prev => prev.map(employee => 
      employee.id === employeeId 
        ? { 
            ...employee, 
            toolDeductions: (employee.toolDeductions || []).filter(tool => tool.id !== toolId),
            updatedAt: new Date().toISOString() 
          }
        : employee
    ));

    toast({
      title: "Tool Deduction Removed! 🗑️",
      description: "Tool deduction has been removed."
    });
    if (callback) callback();
  }, []);

  // Bank hours for an employee
  const bankHours = useCallback((employeeId, hoursToBank, callback) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive"
      });
      return;
    }

    const newBankedHours = (employee.bankedHours || 0) + parseFloat(hoursToBank);

    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, bankedHours: newBankedHours, updatedAt: new Date().toISOString() }
        : emp
    ));

    toast({
      title: "Hours Banked! 🏦",
      description: `${hoursToBank} hours banked for ${employee.firstName}. Total banked: ${newBankedHours} hours.`
    });
    if (callback) callback();
  }, [employees]);

  // Use banked hours
  const useBankedHours = useCallback((employeeId, hoursToUse, callback) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      toast({
        title: "Error",
        description: "Employee not found.",
        variant: "destructive"
      });
      return;
    }

    const currentBanked = employee.bankedHours || 0;
    if (hoursToUse > currentBanked) {
      toast({
        title: "Insufficient Banked Hours",
        description: `Only ${currentBanked} hours available in bank.`,
        variant: "destructive"
      });
      return;
    }

    const newBankedHours = currentBanked - parseFloat(hoursToUse);

    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, bankedHours: newBankedHours, updatedAt: new Date().toISOString() }
        : emp
    ));

    toast({
      title: "Banked Hours Used! 💰",
      description: `${hoursToUse} banked hours used for ${employee.firstName}. Remaining: ${newBankedHours} hours.`
    });
    if (callback) callback();
  }, [employees]);

  // Update employee tool deductions (for payroll processing)
  const updateEmployeeToolDeductions = useCallback((employeeId, updatedToolDeductions) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, toolDeductions: updatedToolDeductions, updatedAt: new Date().toISOString() }
        : emp
    ));
  }, []);

  // Add document to employee
  const addEmployeeDocument = useCallback((employeeId, document, callback) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { 
            ...emp, 
            documents: [...(emp.documents || []), document],
            updatedAt: new Date().toISOString() 
          }
        : emp
    ));

    toast({
      title: "Document Added! 📄",
      description: `${document.name} has been uploaded successfully.`
    });
    if (callback) callback();
  }, []);

  // Remove document from employee
  const removeEmployeeDocument = useCallback((employeeId, documentId, callback) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { 
            ...emp, 
            documents: (emp.documents || []).filter(doc => doc.id !== documentId),
            updatedAt: new Date().toISOString() 
          }
        : emp
    ));

    toast({
      title: "Document Removed! 🗑️",
      description: "Document has been deleted successfully."
    });
    if (callback) callback();
  }, []);

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
    removeEmployeeDocument
  };
}