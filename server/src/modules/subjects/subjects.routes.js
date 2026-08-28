const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

// GET /api/v1/subjects
router.get('/', async (req, res, next) => {
  try {
    const { instituteId } = req.tenant;
    const subjects = await db('subjects')
      .where('institute_id', instituteId)
      .andWhere('status', 'ACTIVE')
      .orderBy('semester', 'asc');

    for (const sub of subjects) {
      const allocations = await db('staff_subjects')
        .join('staff', 'staff_subjects.staff_id', 'staff.id')
        .join('staff_profiles', 'staff.id', 'staff_profiles.staff_id')
        .where('staff_subjects.subject_id', sub.id)
        .select(
          'staff_subjects.*',
          'staff_profiles.first_name',
          'staff_profiles.last_name',
          'staff_profiles.official_email',
          'staff.employee_code'
        );
      sub.allocations = allocations;
    }

    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    next(err);
  }
});

// POST /api/v1/subjects/allocate
router.post('/allocate', async (req, res, next) => {
  try {
    const { staffId, subjectId, academicYear, semester, section } = req.body;
    const id = `ss-${uuidv4().slice(0, 8)}`;
    await db('staff_subjects').insert({
      id,
      staff_id: staffId,
      subject_id: subjectId,
      academic_year: academicYear || '2026-2027',
      semester: semester ? parseInt(semester, 10) : 1,
      section: section || 'A',
    });
    console.log('[CampusAUM API]: Allocated subject in PostgreSQL:', id);
    res.status(201).json({ success: true, message: 'Subject allocated to faculty member.' });
  } catch (err) {
    console.error('Error allocating subject in PostgreSQL:', err);
    next(err);
  }
});

module.exports = router;
