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

// PUT /campuses/:id - Edit Campus (Super Admin)
router.put('/campuses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, address, city, state, pincode, status } = req.body;

    const existing = await db('campuses').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Campus not found.' });
    }

    const auditData = {
      ...(name && { name }),
      ...(code && { code: code.toUpperCase() }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
      ...(status && { status }),
    };

    const updatedFields = {
      ...auditData,
      updated_at: db.fn.now(),
    };

    await db('campuses').where({ id }).update(updatedFields);

    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: existing.organization_id,
      user_id: req.user?.id || 'admin',
      action: 'UPDATE',
      entity_type: 'CAMPUS',
      entity_id: id,
      new_values: JSON.stringify(auditData),
    });

    console.log('[CampusAUM API]: Updated Campus:', id);
    res.json({ success: true, message: 'Campus updated successfully.' });
  } catch (err) {
    console.error('Error updating campus:', err);
    next(err);
  }
});

// DELETE /campuses/:id - Soft Delete Campus (Super Admin)
router.delete('/campuses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db('campuses').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Campus not found.' });
    }

    await db('campuses').where({ id }).update({ status: 'INACTIVE', updated_at: db.fn.now() });
    await db('institutes').where({ campus_id: id }).update({ status: 'INACTIVE', updated_at: db.fn.now() });

    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: existing.organization_id,
      user_id: req.user?.id || 'admin',
      action: 'DELETE',
      entity_type: 'CAMPUS',
      entity_id: id,
      new_values: JSON.stringify({ status: 'INACTIVE' }),
    });

    console.log('[CampusAUM API]: Soft-deleted Campus:', id);
    res.json({ success: true, message: 'Campus deactivated successfully.' });
  } catch (err) {
    console.error('Error deleting campus:', err);
    next(err);
  }
});

// PUT /institutes/:id - Edit Institute (Super Admin)
router.put('/institutes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { campusId, campus_id, name, code, type, address, status } = req.body;

    const existing = await db('institutes').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Institute not found.' });
    }

    const targetCampusId = campusId || campus_id;

    const auditData = {
      ...(targetCampusId && { campus_id: targetCampusId }),
      ...(name && { name }),
      ...(code && { code: code.toUpperCase() }),
      ...(type && { type }),
      ...(address !== undefined && { address }),
      ...(status && { status }),
    };

    const updatedFields = {
      ...auditData,
      updated_at: db.fn.now(),
    };

    await db('institutes').where({ id }).update(updatedFields);

    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: req.tenant?.organizationId || 'org-apex-01',
      user_id: req.user?.id || 'admin',
      action: 'UPDATE',
      entity_type: 'INSTITUTE',
      entity_id: id,
      new_values: JSON.stringify(auditData),
    });

    console.log('[CampusAUM API]: Updated Institute:', id);
    res.json({ success: true, message: 'Institute updated successfully.' });
  } catch (err) {
    console.error('Error updating institute:', err);
    next(err);
  }
});

// DELETE /institutes/:id - Soft Delete Institute (Super Admin)
router.delete('/institutes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db('institutes').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Institute not found.' });
    }

    await db('institutes').where({ id }).update({ status: 'INACTIVE', updated_at: db.fn.now() });

    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: req.tenant?.organizationId || 'org-apex-01',
      user_id: req.user?.id || 'admin',
      action: 'DELETE',
      entity_type: 'INSTITUTE',
      entity_id: id,
      new_values: JSON.stringify({ status: 'INACTIVE' }),
    });

    console.log('[CampusAUM API]: Soft-deleted Institute:', id);
    res.json({ success: true, message: 'Institute deactivated successfully.' });
  } catch (err) {
    console.error('Error deleting institute:', err);
    next(err);
  }
});

module.exports = router;

