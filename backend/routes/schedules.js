const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Get all schedules
router.get('/', optionalAuth, async (req, res) => {
  try {
    const schedules = await storage.getSchedules();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules', message: error.message });
  }
});

// Create new schedule
router.post('/', optionalAuth, async (req, res) => {
  try {
    const schedule = await storage.createSchedule(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule', message: error.message });
  }
});

// Update schedule
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const schedules = await storage.getSchedules();
    const index = schedules.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    schedules[index] = {
      ...schedules[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await storage.saveSchedules(schedules);
    res.json(schedules[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule', message: error.message });
  }
});

module.exports = router;
