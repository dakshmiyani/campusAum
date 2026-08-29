const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

// Get all organizations
router.get('/organizations', async (req, res, next) => {
  try {
    const orgs = await db('organizations').where('status', 'ACTIVE');
    res.json({ success: true, data: orgs });
  } catch (err) {
    next(err);
  }
});

// Get campuses for an organization
router.get('/campuses', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const targetOrgId = req.query.organization_id || organizationId;
    const campuses = await db('campuses')
      .where('organization_id', targetOrgId)
      .andWhere('status', 'ACTIVE')
      .orderBy('created_at', 'asc');
    res.json({ success: true, data: campuses });
  } catch (err) {
    next(err);
  }
});

// POST /campuses - Add new Campus (Super Admin)
router.post('/campuses', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const { name, code, address, city, state, pincode } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Campus Name and Code are required.' });
    }

    const campusId = `campus-${uuidv4().slice(0, 8)}`;
    const newCampus = {
      id: campusId,
      organization_id: req.body.organization_id || organizationId,
      name,
      code: code.toUpperCase(),
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      status: 'ACTIVE',
    };

    await db('campuses').insert(newCampus);

    // Audit log
    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: organizationId,
      user_id: req.user?.id || 'admin',
      action: 'CREATE',
      entity_type: 'CAMPUS',
      entity_id: campusId,
      new_values: JSON.stringify(newCampus),
    });

    console.log('[CampusAUM API]: Created new Campus:', campusId, name);
    res.status(201).json({ success: true, message: 'Campus created successfully.', data: newCampus });
  } catch (err) {
    console.error('Error creating campus:', err);
    next(err);
  }
});

// Get institutes for a campus or org
router.get('/institutes', async (req, res, next) => {
  try {
    const { campusId, campus_id } = req.query;
    const targetCampusId = campusId || campus_id;
    let query = db('institutes').where('status', 'ACTIVE').orderBy('created_at', 'asc');
    if (targetCampusId && targetCampusId !== 'all') {
      query = query.where('campus_id', targetCampusId);
    }
    const institutes = await query;
    res.json({ success: true, data: institutes });
  } catch (err) {
    next(err);
  }
});

// POST /institutes - Add new Institute (Super Admin)
router.post('/institutes', async (req, res, next) => {
  try {
    const { organizationId, campusId } = req.tenant;
    const { name, code, type, address } = req.body;
    const targetCampusId = req.body.campusId || req.body.campus_id || campusId;

    if (!name || !code || !targetCampusId) {
      return res.status(400).json({ success: false, message: 'Institute Name, Code, and Campus are required.' });
    }

    const instId = `inst-${uuidv4().slice(0, 8)}`;
    const newInstitute = {
      id: instId,
      campus_id: targetCampusId,
      name,
      code: code.toUpperCase(),
      type: type || 'ENGINEERING',
      address: address || '',
      status: 'ACTIVE',
    };

    await db('institutes').insert(newInstitute);

    // Audit log
    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: organizationId,
      user_id: req.user?.id || 'admin',
      action: 'CREATE',
      entity_type: 'INSTITUTE',
      entity_id: instId,
      new_values: JSON.stringify(newInstitute),
    });

    console.log('[CampusAUM API]: Created new Institute:', instId, name);
    res.status(201).json({ success: true, message: 'Institute created successfully.', data: newInstitute });
  } catch (err) {
    console.error('Error creating institute:', err);
    next(err);
  }
});

module.exports = router;

