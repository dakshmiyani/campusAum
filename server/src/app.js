const express = require('express');
const cors = require('cors');
const tenantResolver = require('./middleware/tenant.middleware');
const authenticate = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/error.middleware');

const orgRoutes = require('./modules/organizations/organizations.routes');
const staffRoutes = require('./modules/staff/staff.routes');
const deptRoutes = require('./modules/departments/departments.routes');
const desigRoutes = require('./modules/designations/designations.routes');
const qualRoutes = require('./modules/qualifications/qualifications.routes');
const subjectRoutes = require('./modules/subjects/subjects.routes');
const docRoutes = require('./modules/documents/documents.routes');
const reportRoutes = require('./modules/reports/reports.routes');
const settingsRoutes = require('./modules/settings/settings.routes');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Tenant & Authentication Context
app.use(tenantResolver);
app.use(authenticate);

// Health Check API
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'CampusAUM SaaS Backend',
    version: '1.0.0',
    tenant: req.tenant,
    timestamp: new Date().toISOString(),
  });
});

// API v1 Routes
app.use('/api/v1', orgRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/departments', deptRoutes);
app.use('/api/v1/designations', desigRoutes);
app.use('/api/v1/qualifications', qualRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/documents', docRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
