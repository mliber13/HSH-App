const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Get all suppliers
router.get('/', optionalAuth, async (req, res) => {
  try {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers', message: error.message });
  }
});

// Update suppliers
router.put('/', optionalAuth, async (req, res) => {
  try {
    await storage.saveSuppliers(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update suppliers', message: error.message });
  }
});

module.exports = router;
