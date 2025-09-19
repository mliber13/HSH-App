const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../dist')));

// Import routes
const jobsRoutes = require('./routes/jobs');
const employeesRoutes = require('./routes/employees');
const timeEntriesRoutes = require('./routes/timeEntries');
const schedulesRoutes = require('./routes/schedules');
const inventoryRoutes = require('./routes/inventory');
const suppliersRoutes = require('./routes/suppliers');
const authRoutes = require('./routes/auth');
const migrationRoutes = require('./routes/migration');

// Use routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/migration', migrationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HSH Construction Management API is running' });
});

// Serve the React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HSH Construction Management API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
