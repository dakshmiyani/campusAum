const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

// GET /api/v1/departments
router.get('/', async (req, res, next) => {
  try {
    const { instituteId } = req.tenant;
    const departments = await db('departments')
      .leftJoin('staff', 'departments.hod_staff_id', 'staff.id')
      .leftJoin('staff_profiles', 'staff.id', 'staff_profiles.staff_id')
      .where('departments.status', 'ACTIVE')
      .select(
        'departments.*',
        'staff_profiles.first_name as hod_first_name',
        'staff_profiles.last_name as hod_last_name',
        'staff_profiles.official_email as hod_email'
      );

    // Attach staff counts per department
    for (const d of departments) {
      const [{ count }] = await db('staff')
        .where('department_id', d.id)
        .andWhere('status', 'ACTIVE')
        .count('id as count');
      d.staff_count = parseInt(count, 10);
    }

    res.json({ success: true, data: departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    next(err);
  }
});

// POST /api/v1/departments
router.post('/', async (req, res, next) => {
  try {
    const { instituteId } = req.tenant;
    const { name, code, description, hodStaffId } = req.body;

    const deptId = `dept-${uuidv4().slice(0, 8)}`;
    await db('departments').insert({
      id: deptId,
      institute_id: req.body.instituteId || instituteId,
      name,
      code,
      description: description || '',
      hod_staff_id: hodStaffId || null,
      status: 'ACTIVE',
    });

    console.log('[CampusAUM API]: Created department in PostgreSQL:', deptId);
    res.status(201).json({ success: true, message: 'Department created.', data: { id: deptId, name, code } });
  } catch (err) {
    console.error('Error creating department in PostgreSQL:', err);
    next(err);
  }
});

module.exports = router;
