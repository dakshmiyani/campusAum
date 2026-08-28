const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

router.get('/', async (req, res, next) => {
  try {
    const qualifications = await db('qualifications').orderBy('name', 'asc');
    res.json({ success: true, data: qualifications });
  } catch (err) {
    console.error('Error fetching qualifications:', err);
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, level, specialization } = req.body;
    const id = `qual-${uuidv4().slice(0, 8)}`;
    await db('qualifications').insert({
      id,
      name,
      level: level || 'UNDER_GRADUATE',
      specialization: specialization || '',
    });
    console.log('[CampusAUM API]: Created qualification in PostgreSQL:', id);
    res.status(201).json({ success: true, message: 'Qualification added.', data: { id, name } });
  } catch (err) {
    console.error('Error creating qualification in PostgreSQL:', err);
    next(err);
  }
});

module.exports = router;
