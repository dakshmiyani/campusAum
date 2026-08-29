const express = require('express');
const router = express.Router();
const db = require('../../database/knex');

// GET /api/v1/reports/summary
router.get('/summary', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const campusId = req.query.campusId || req.query.campus_id || req.headers['x-campus-id'];
    const instituteId = req.query.instituteId || req.query.institute_id || req.headers['x-institute-id'];

    const applyScope = (query) => {
      let q = query.where('staff.organization_id', organizationId);
      if (campusId && campusId !== 'all') {
        q = q.andWhere('staff.campus_id', campusId);
      }
      if (instituteId && instituteId !== 'all') {
        q = q.andWhere('staff.institute_id', instituteId);
      }
      return q;
    };

    // 1. Total Staff
    const [{ totalStaff }] = await applyScope(db('staff')).count('id as totalStaff');

    // 2. Teaching vs Non-Teaching
    const [{ teachingCount }] = await applyScope(db('staff').where('staff_type', 'TEACHING')).count('id as teachingCount');
    const [{ nonTeachingCount }] = await applyScope(db('staff').where('staff_type', 'NON_TEACHING')).count('id as nonTeachingCount');

    // 3. Department Breakdown
    const deptBreakdown = await applyScope(db('staff').join('departments', 'staff.department_id', 'departments.id'))
      .groupBy('departments.name')
      .select('departments.name as department_name', db.raw('COUNT(staff.id) as staff_count'));

    // 4. Designation Breakdown
    const desigBreakdown = await applyScope(db('staff').join('designations', 'staff.designation_id', 'designations.id'))
      .groupBy('designations.name')
      .select('designations.name as designation_name', db.raw('COUNT(staff.id) as staff_count'));

    // 5. Qualification breakdown
    const qualBreakdown = await applyScope(db('staff_qualifications').join('staff', 'staff_qualifications.staff_id', 'staff.id'))
      .groupBy('degree_name')
      .select('degree_name', db.raw('COUNT(staff_qualifications.id) as count'));

    // 6. Total Payroll Gross Amount
    const salarySum = await applyScope(db('staff_salary').join('staff', 'staff_salary.staff_id', 'staff.id'))
      .sum('gross_salary as totalGross')
      .sum('net_salary as totalNet')
      .first();

    res.json({
      success: true,
      data: {
        totalStaff: parseInt(totalStaff, 10),
        teachingCount: parseInt(teachingCount, 10),
        nonTeachingCount: parseInt(nonTeachingCount, 10),
        departmentBreakdown: deptBreakdown,
        designationBreakdown: desigBreakdown,
        qualificationBreakdown: qualBreakdown,
        payroll: {
          totalGross: salarySum?.totalGross || 0,
          totalNet: salarySum?.totalNet || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
