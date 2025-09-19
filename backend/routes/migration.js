const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Import data from localStorage format
router.post('/import', optionalAuth, async (req, res) => {
  try {
    const result = await storage.importFromLocalStorage(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Import failed', 
      message: error.message 
    });
  }
});

// Export data to localStorage format
router.get('/export', optionalAuth, async (req, res) => {
  try {
    const data = await storage.exportToLocalStorage();
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Export failed', 
      message: error.message 
    });
  }
});

// Get current data summary
router.get('/summary', optionalAuth, async (req, res) => {
  try {
    const jobs = await storage.getJobs();
    const employees = await storage.getEmployees();
    const timeEntries = await storage.getTimeEntries();
    const schedules = await storage.getSchedules();
    const inventory = await storage.getInventory();
    const suppliers = await storage.getSuppliers();

    res.json({
      jobs: jobs.length,
      employees: employees.length,
      timeEntries: timeEntries.length,
      schedules: schedules.length,
      inventory: inventory.length,
      suppliers: suppliers.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get summary', 
      message: error.message 
    });
  }
});

// Clear all data (for testing)
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    await storage.saveJobs([]);
    await storage.saveEmployees([]);
    await storage.saveTimeEntries([]);
    await storage.saveSchedules([]);
    await storage.saveInventory([]);
    await storage.saveSuppliers([]);
    await storage.writeFile('pieceRateEntries.json', []);
    await storage.writeFile('payrollReports.json', []);
    await storage.writeFile('checklistTemplates.json', []);
    await storage.writeFile('jobMessages.json', {});
    await storage.saveQuickBooksQueue([]);
    await storage.saveUserData({});

    res.json({ 
      success: true, 
      message: 'All data cleared successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to clear data', 
      message: error.message 
    });
  }
});

module.exports = router;

