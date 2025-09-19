const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Get all inventory
router.get('/', optionalAuth, async (req, res) => {
  try {
    const inventory = await storage.getInventory();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory', message: error.message });
  }
});

// Update inventory
router.put('/', optionalAuth, async (req, res) => {
  try {
    await storage.saveInventory(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory', message: error.message });
  }
});

module.exports = router;
