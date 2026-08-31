const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

// GET /api/v1/departments
router.get('/', async (req, res, next) => {
  try {
    const { campusId, instituteId } = req.query;

    let query = db('departments')
      .join('institutes', 'departments.institute_id', 'institutes.id')
      .join('campuses', 'institutes.campus_id', 'campuses.id')
      .leftJoin('staff', 'departments.hod_staff_id', 'staff.id')
      .leftJoin('staff_profiles', 'staff.id', 'staff_profiles.staff_id')
      .where('departments.status', 'ACTIVE');

    if (campusId) {
      query = query.andWhere('institutes.campus_id', campusId);
    }
    if (instituteId) {
      query = query.andWhere('departments.institute_id', instituteId);
    }

    const departments = await query.select(
      'departments.*',
      'institutes.name as institute_name',
      'institutes.code as institute_code',
      'campuses.id as campus_id',
      'campuses.name as campus_name',
      'campuses.code as campus_code',
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
    const { instituteId: headerInstId } = req.tenant;
    const { name, code, description, hodStaffId, instituteId, campusId } = req.body;

    let targetInstituteId = instituteId || headerInstId;

    if (!targetInstituteId && campusId) {
      const inst = await db('institutes').where('campus_id', campusId).first();
      if (inst) targetInstituteId = inst.id;
    }

    if (!targetInstituteId) {
      const firstInst = await db('institutes').first();
      targetInstituteId = firstInst ? firstInst.id : 'inst-iet-01';
    }

    const deptId = `dept-${uuidv4().slice(0, 8)}`;
    await db('departments').insert({
      id: deptId,
      institute_id: targetInstituteId,
      name,
      code,
      description: description || '',
      hod_staff_id: hodStaffId || null,
      status: 'ACTIVE',
    });

    console.log('[CampusAUM API]: Created department in PostgreSQL:', deptId, 'mapped to institute:', targetInstituteId);
    res.status(201).json({ success: true, message: 'Department created.', data: { id: deptId, name, code, institute_id: targetInstituteId } });
  } catch (err) {
    console.error('Error creating department in PostgreSQL:', err);
    next(err);
  }
});

module.exports = router;
