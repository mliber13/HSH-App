import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// ===== ENHANCED DATA PERSISTENCE SYSTEM =====

// Storage keys with versioning
const STORAGE_KEYS = {
  JOBS: 'hsh_drywall_jobs_v2',
  EMPLOYEES: 'hsh_drywall_employees_v2', 
  TIME_ENTRIES: 'hsh_drywall_time_entries_v2',
  PIECE_RATE_ENTRIES: 'hsh_drywall_piece_rate_entries_v2',
  PAYROLL_ENTRIES: 'hsh_drywall_payroll_entries_v2',
  DAILY_LOGS: 'hsh_drywall_daily_logs_v2',
  SCHEDULES: 'hsh_drywall_schedules_v2',
  USER_DATA: 'hsh_drywall_user_data_v2',
  CHECKLIST_TEMPLATES: 'hsh_drywall_checklist_templates_v2'
};

// Data validation schemas
const validateData = (data, type) => {
  if (!data) return false;
  
  switch (type) {
    case 'jobs':
      return Array.isArray(data) && data.every(job => job.id && job.jobName);
    case 'employees':
      return Array.isArray(data) && data.every(emp => emp.id && emp.firstName && emp.lastName);
    case 'timeEntries':
      return Array.isArray(data) && data.every(entry => entry.id && entry.jobId);
    case 'pieceRateEntries':
      return Array.isArray(data) && data.every(entry => entry.id && entry.jobId);
    case 'payrollEntries':
      return Array.isArray(data) && data.every(entry => entry.id && entry.employeeId);
    case 'dailyLogs':
      return Array.isArray(data) && data.every(log => log.id && log.jobId);
    case 'schedules':
      return Array.isArray(data) && data.every(schedule => schedule.id && schedule.jobId);
    case 'userData':
      return data && typeof data === 'object' && data.id;
    default:
      return true;
  }
};

// Enhanced storage functions with validation and error handling
export const storage = {
  // Save data with validation and error handling
  save: (key, data, type = 'generic') => {
    try {
      // Validate data before saving
      if (!validateData(data, type)) {
        console.warn(`Data validation failed for ${key}:`, data);
        return false;
      }

      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      
      // Verify save was successful
      const saved = localStorage.getItem(key);
      if (saved !== serialized) {
        throw new Error('Data verification failed after save');
      }

      return true;
    } catch (error) {
      console.error(`Failed to save data to ${key}:`, error);
      
      // Try to recover by clearing corrupted data
      try {
        localStorage.removeItem(key);
        console.log(`Cleared corrupted data for ${key}`);
      } catch (clearError) {
        console.error(`Failed to clear corrupted data for ${key}:`, clearError);
      }
      
      return false;
    }
  },

  // Load data with validation and fallback
  load: (key, defaultValue = null, type = 'generic') => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const data = JSON.parse(item);
      
      // Validate loaded data
      if (!validateData(data, type)) {
        console.warn(`Loaded data validation failed for ${key}, using default`);
        return defaultValue;
      }

      return data;
    } catch (error) {
      console.error(`Failed to load data from ${key}:`, error);
      
      // Clear corrupted data
      try {
        localStorage.removeItem(key);
        console.log(`Cleared corrupted data for ${key}`);
      } catch (clearError) {
        console.error(`Failed to clear corrupted data for ${key}:`, clearError);
      }
      
      return defaultValue;
    }
  },

  // Clear specific data
  clear: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to clear ${key}:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('All app data cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  },

  // Get storage usage info
  getUsage: () => {
    try {
      const usage = {};
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const data = localStorage.getItem(key);
        if (data) {
          usage[name] = {
            size: new Blob([data]).size,
            itemCount: Array.isArray(JSON.parse(data)) ? JSON.parse(data).length : 1
          };
        }
      });
      return usage;
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return {};
    }
  },

  // Export all data for backup
  export: () => {
    try {
      const exportData = {};
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const data = localStorage.getItem(key);
        if (data) {
          exportData[name] = JSON.parse(data);
        }
      });
      return exportData;
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  },

  // Import data from backup
  import: (importData) => {
    try {
      if (!importData || typeof importData !== 'object') {
        throw new Error('Invalid import data');
      }

      Object.entries(importData).forEach(([name, data]) => {
        const key = STORAGE_KEYS[name.toUpperCase()];
        if (key && validateData(data, name.toLowerCase())) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};

// Export storage keys for use in hooks
export { STORAGE_KEYS };

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Test data generators for development
export const testData = {
  // Generate sample jobs for testing
  generateJobs: () => [
    {
      id: 'test-job-1',
      jobName: 'Downtown Office Building',
      jobType: 'commercial',
      status: 'In Progress',
      startDate: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      address: '123 Main St, Downtown, CA 90210',
      clientName: 'ABC Development',
      clientPhone: '(555) 123-4567',
      clientEmail: 'contact@abcdev.com',
      financials: {
        estimate: {
          sqft: 15000,
          drywallMaterialRate: 0.66,
          hangerRate: 0.27,
          finisherRate: 0.27,
          prepCleanRate: 0.03,
          drywallSalesTaxRate: 8.25,
          totalEstimateAmount: 25000
        },
        fieldRevised: {
          sqft: 15200,
          hangerRate: 0.27,
          finisherRate: 0.27,
          prepCleanRate: 0.03,
          drywallMaterialRate: 0.66,
          changeOrders: []
        },
        actual: {
          laborCosts: [],
          materialInvoices: [],
          changeOrders: [],
          manualLaborCosts: []
        }
      },
      scopes: [],
      takeoffs: [],
      schedules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-job-2', 
      jobName: 'Residential Home Addition',
      jobType: 'residential',
      status: 'Not Started',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      address: '456 Oak Ave, Suburbia, CA 90211',
      clientName: 'Smith Family',
      clientPhone: '(555) 987-6543',
      clientEmail: 'smith@email.com',
      financials: {
        estimate: {
          sqft: 8000,
          drywallMaterialRate: 0.66,
          hangerRate: 0.27,
          finisherRate: 0.27,
          prepCleanRate: 0.03,
          drywallSalesTaxRate: 8.25,
          totalEstimateAmount: 15000
        },
        fieldRevised: {
          sqft: 8000,
          hangerRate: 0.27,
          finisherRate: 0.27,
          prepCleanRate: 0.03,
          drywallMaterialRate: 0.66,
          changeOrders: []
        },
        actual: {
          laborCosts: [],
          materialInvoices: [],
          changeOrders: [],
          manualLaborCosts: []
        }
      },
      scopes: [],
      takeoffs: [],
      schedules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // Generate sample employees for testing
  generateEmployees: () => [
    {
      id: 'test-hanger-1',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '(555) 123-4567',
      employeeType: 'Employee',
      role: 'Hanger',
      payType: 'hourly',
      hourlyRate: 28.00,
      salaryAmount: 0,
      isActive: true,
      bankedHours: 0,
      perDiem: 0,
      fuelAllowance: 0,
      toolDeductions: [],
      childSupportDeduction: 0,
      miscDeduction: 0,
      miscDeductionNote: '',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'test-finisher-1',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      phone: '(555) 234-5678',
      employeeType: '1099 Contractor',
      role: 'Finisher',
      payType: 'salary',
      hourlyRate: 0,
      salaryAmount: 2431.00,
      isActive: true,
      bankedHours: 0,
      perDiem: 75.00,
      fuelAllowance: 200.00,
      toolDeductions: [
        {
          id: 'tool-1',
          description: 'Drywall Lift',
          totalAmount: 1000.00,
          weeklyDeduction: 100.00,
          remainingBalance: 800.00,
          startDate: new Date().toISOString()
        }
      ],
      childSupportDeduction: 150.00,
      miscDeduction: 0,
      miscDeductionNote: '',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};
