const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Get all time entries
router.get('/', optionalAuth, async (req, res) => {
  try {
    const timeEntries = await storage.getTimeEntries();
    res.json(timeEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time entries', message: error.message });
  }
});

// Get time entries by employee ID
router.get('/employee/:employeeId', optionalAuth, async (req, res) => {
  try {
    const timeEntries = await storage.getTimeEntries();
    const employeeEntries = timeEntries.filter(entry => entry.employeeId === req.params.employeeId);
    res.json(employeeEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee time entries', message: error.message });
  }
});

// Get time entries by job ID
router.get('/job/:jobId', optionalAuth, async (req, res) => {
  try {
    const timeEntries = await storage.getTimeEntries();
    const jobEntries = timeEntries.filter(entry => entry.jobId === req.params.jobId);
    res.json(jobEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job time entries', message: error.message });
  }
});

// Create new time entry
router.post('/', optionalAuth, async (req, res) => {
  try {
    const timeEntry = await storage.createTimeEntry(req.body);
    res.status(201).json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create time entry', message: error.message });
  }
});

// Update time entry
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const updatedEntry = await storage.updateTimeEntry(req.params.id, req.body);
    res.json(updatedEntry);
  } catch (error) {
    if (error.message === 'Time entry not found') {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    res.status(500).json({ error: 'Failed to update time entry', message: error.message });
  }
});

// Delete time entry
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const timeEntries = await storage.getTimeEntries();
    const filteredEntries = timeEntries.filter(entry => entry.id !== req.params.id);
    await storage.saveTimeEntries(filteredEntries);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete time entry', message: error.message });
  }
});

// Clock in
router.post('/clock-in', optionalAuth, async (req, res) => {
  try {
    const { employeeId, jobId, location, timestamp } = req.body;
    
    const timeEntry = await storage.createTimeEntry({
      employeeId,
      jobId,
      clockInTime: timestamp || new Date().toISOString(),
      clockInLocation: location,
      status: 'working'
    });
    
    res.status(201).json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clock in', message: error.message });
  }
});

// Clock out
router.put('/:id/clock-out', optionalAuth, async (req, res) => {
  try {
    const { location, timestamp } = req.body;
    
    const updatedEntry = await storage.updateTimeEntry(req.params.id, {
      clockOutTime: timestamp || new Date().toISOString(),
      clockOutLocation: location,
      status: 'completed'
    });
    
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clock out', message: error.message });
  }
});

module.exports = router;
