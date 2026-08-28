const express = require('express');
const router = express.Router();
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
    const campuses = await db('campuses')
      .where('organization_id', organizationId)
      .andWhere('status', 'ACTIVE');
    res.json({ success: true, data: campuses });
  } catch (err) {
    next(err);
  }
});

// Get institutes for a campus
router.get('/institutes', async (req, res, next) => {
  try {
    const { campusId } = req.query;
    let query = db('institutes').where('status', 'ACTIVE');
    if (campusId) {
      query = query.where('campus_id', campusId);
    }
    const institutes = await query;
    res.json({ success: true, data: institutes });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
