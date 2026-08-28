const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

// GET /api/v1/designations
router.get('/', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const designations = await db('designations')
      .where('organization_id', organizationId)
      .andWhere('status', 'ACTIVE')
      .orderBy('level', 'asc');

    for (const d of designations) {
      const [{ count }] = await db('staff')
        .where('designation_id', d.id)
        .andWhere('status', 'ACTIVE')
        .count('id as count');
      d.staff_count = parseInt(count, 10);
    }

    res.json({ success: true, data: designations });
  } catch (err) {
    console.error('Error fetching designations:', err);
    next(err);
  }
});

// POST /api/v1/designations
router.post('/', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const { name, code, level, description } = req.body;

    const id = `desig-${uuidv4().slice(0, 8)}`;
    await db('designations').insert({
      id,
      organization_id: organizationId,
      name,
      code,
      level: level ? parseInt(level, 10) : 4,
      description: description || '',
      status: 'ACTIVE',
    });

    console.log('[CampusAUM API]: Created designation in PostgreSQL:', id);
    res.status(201).json({ success: true, message: 'Designation created.', data: { id, name, code } });
  } catch (err) {
    console.error('Error creating designation in PostgreSQL:', err);
    next(err);
  }
});

module.exports = router;
