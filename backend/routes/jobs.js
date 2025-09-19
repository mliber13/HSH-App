const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { optionalAuth } = require('../middleware/auth');

// Get all jobs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const jobs = await storage.getJobs();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
  }
});

// Get job by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job', message: error.message });
  }
});

// Create new job
router.post('/', optionalAuth, async (req, res) => {
  try {
    const job = await storage.createJob(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job', message: error.message });
  }
});

// Update job
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    const updatedJob = await storage.updateJob(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    if (error.message === 'Job not found') {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(500).json({ error: 'Failed to update job', message: error.message });
  }
});

// Delete job
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    await storage.deleteJob(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job', message: error.message });
  }
});

// Update job financials (for commercial estimates, etc.)
router.put('/:id/financials', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedJob = await storage.updateJob(req.params.id, {
      financials: {
        ...job.financials,
        ...req.body
      },
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job financials', message: error.message });
  }
});

// Update job scopes
router.put('/:id/scopes', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedJob = await storage.updateJob(req.params.id, {
      scopes: req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job scopes', message: error.message });
  }
});

// Update job takeoff phases
router.put('/:id/takeoff-phases', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedJob = await storage.updateJob(req.params.id, {
      takeoffPhases: req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update takeoff phases', message: error.message });
  }
});

// Update job checklists
router.put('/:id/checklists', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedJob = await storage.updateJob(req.params.id, {
      checklists: req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update checklists', message: error.message });
  }
});

// Update job documents
router.put('/:id/documents', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedJob = await storage.updateJob(req.params.id, {
      documents: req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update documents', message: error.message });
  }
});

// Update job daily logs
router.put('/:id/daily-logs', optionalAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedJob = await storage.updateJob(req.params.id, {
      dailyLogs: req.body,
      updatedAt: new Date().toISOString()
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update daily logs', message: error.message });
  }
});

module.exports = router;
