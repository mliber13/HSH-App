// Validation utilities for HSH Construction Management App

/**
 * Validation rules and helper functions
 */

// Job validation rules
export const jobValidationRules = {
  jobName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
    message: "Job name must be 2-100 characters and contain only letters, numbers, spaces, and basic punctuation"
  },
  jobType: {
    required: true,
    allowedValues: ['residential', 'residential-construction', 'commercial'],
    message: "Please select a valid job type"
  },
  generalContractorId: {
    required: true,
    message: "Please select a General Contractor"
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
    message: "Address must be 5-200 characters"
  },
  lockboxCode: {
    required: false,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9\-_]*$/,
    message: "Lockbox code can only contain letters, numbers, hyphens, and underscores"
  },
  geofenceRadius: {
    required: false,
    min: 50,
    max: 5000,
    message: "Geofence radius must be between 50 and 5000 feet"
  }
};

// Scope validation rules
export const scopeValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
    message: "Scope name must be 2-50 characters and contain only letters, numbers, spaces, and basic punctuation"
  },
  description: {
    required: false,
    maxLength: 500,
    message: "Description cannot exceed 500 characters"
  },
  status: {
    required: true,
    allowedValues: ['Not Started', 'In Progress', 'Complete'],
    message: "Please select a valid status"
  }
};

// Employee validation rules
export const employeeValidationRules = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    message: "First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    message: "Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: "Please enter a valid phone number"
  },
  hourlyRate: {
    required: true,
    min: 0,
    max: 1000,
    message: "Hourly rate must be between $0 and $1000"
  }
};

/**
 * Generic validation function
 */
export function validateField(value, rules) {
  const errors = [];

  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${rules.message || 'This field is required'}`);
    return errors;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return errors;
  }

  const stringValue = value.toString().trim();

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${rules.message || `Minimum length is ${rules.minLength} characters`}`);
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${rules.message || `Maximum length is ${rules.maxLength} characters`}`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.message || 'Invalid format');
  }

  // Numeric validations
  if (rules.min !== undefined && parseFloat(value) < rules.min) {
    errors.push(rules.message || `Value must be at least ${rules.min}`);
  }

  if (rules.max !== undefined && parseFloat(value) > rules.max) {
    errors.push(rules.message || `Value must be no more than ${rules.max}`);
  }

  // Allowed values validation
  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    errors.push(rules.message || `Value must be one of: ${rules.allowedValues.join(', ')}`);
  }

  return errors;
}

/**
 * Validate an entire form object
 */
export function validateForm(formData, validationRules) {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const fieldErrors = validateField(formData[field], validationRules[field]);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Check for duplicate job names
 */
export function checkDuplicateJobName(jobName, existingJobs, excludeJobId = null) {
  if (!jobName || !existingJobs) return false;
  
  const trimmedName = jobName.trim().toLowerCase();
  return existingJobs.some(job => 
    job.id !== excludeJobId && 
    job.jobName.trim().toLowerCase() === trimmedName
  );
}

/**
 * Check for duplicate scope names within a job
 */
export function checkDuplicateScopeName(scopeName, jobScopes, excludeScopeId = null) {
  if (!scopeName || !jobScopes) return false;
  
  const trimmedName = scopeName.trim().toLowerCase();
  return jobScopes.some(scope => 
    scope.id !== excludeScopeId && 
    scope.name.trim().toLowerCase() === trimmedName
  );
}

/**
 * Check for duplicate employee names
 */
export function checkDuplicateEmployeeName(firstName, lastName, existingEmployees, excludeEmployeeId = null) {
  if (!firstName || !lastName || !existingEmployees) return false;
  
  const trimmedFirstName = firstName.trim().toLowerCase();
  const trimmedLastName = lastName.trim().toLowerCase();
  
  return existingEmployees.some(employee => 
    employee.id !== excludeEmployeeId && 
    employee.firstName.trim().toLowerCase() === trimmedFirstName &&
    employee.lastName.trim().toLowerCase() === trimmedLastName
  );
}

/**
 * Sanitize input to prevent XSS and other issues
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors) {
  if (!errors || Object.keys(errors).length === 0) return [];
  
  const formattedErrors = [];
  Object.keys(errors).forEach(field => {
    errors[field].forEach(error => {
      formattedErrors.push(`${field}: ${error}`);
    });
  });
  
  return formattedErrors;
}
