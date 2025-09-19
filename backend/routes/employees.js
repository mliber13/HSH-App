const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Get all employees
router.get('/', optionalAuth, async (req, res) => {
  try {
    const employees = await storage.getEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});

// Get employee by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const employee = await storage.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee', message: error.message });
  }
});

// Create new employee
router.post('/', optionalAuth, async (req, res) => {
  try {
    const employee = await storage.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee', message: error.message });
  }
});

// Update employee
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const updatedEmployee = await storage.updateEmployee(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedEmployee);
  } catch (error) {
    if (error.message === 'Employee not found') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(500).json({ error: 'Failed to update employee', message: error.message });
  }
});

// Delete employee
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const employees = await storage.getEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== req.params.id);
    await storage.saveEmployees(filteredEmployees);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
});

// Update employee documents
router.put('/:id/documents', optionalAuth, async (req, res) => {
  try {
    const employee = await storage.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = await storage.updateEmployee(req.params.id, {
      documents: req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee documents', message: error.message });
  }
});

// Update employee onboarding status
router.put('/:id/onboarding', optionalAuth, async (req, res) => {
  try {
    const employee = await storage.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = await storage.updateEmployee(req.params.id, {
      onboarding: {
        ...employee.onboarding,
        ...req.body
      },
      updatedAt: new Date().toISOString()
    });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update onboarding status', message: error.message });
  }
});

module.exports = router;
