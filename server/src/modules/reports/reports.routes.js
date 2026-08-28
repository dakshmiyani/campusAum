const express = require('express');
const router = express.Router();
const db = require('../../database/knex');

// GET /api/v1/reports/summary
router.get('/summary', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;

    // 1. Total Staff
    const [{ totalStaff }] = await db('staff')
      .where('organization_id', organizationId)
      .count('id as totalStaff');

    // 2. Teaching vs Non-Teaching
    const [{ teachingCount }] = await db('staff')
      .where('organization_id', organizationId)
      .andWhere('staff_type', 'TEACHING')
      .count('id as teachingCount');

    const [{ nonTeachingCount }] = await db('staff')
      .where('organization_id', organizationId)
      .andWhere('staff_type', 'NON_TEACHING')
      .count('id as nonTeachingCount');

    // 3. Department Breakdown
    const deptBreakdown = await db('staff')
      .join('departments', 'staff.department_id', 'departments.id')
      .where('staff.organization_id', organizationId)
      .groupBy('departments.name')
      .select('departments.name as department_name', db.raw('COUNT(staff.id) as staff_count'));

    // 4. Designation Breakdown
    const desigBreakdown = await db('staff')
      .join('designations', 'staff.designation_id', 'designations.id')
      .where('staff.organization_id', organizationId)
      .groupBy('designations.name')
      .select('designations.name as designation_name', db.raw('COUNT(staff.id) as staff_count'));

    // 5. Qualification breakdown
    const qualBreakdown = await db('staff_qualifications')
      .join('staff', 'staff_qualifications.staff_id', 'staff.id')
      .where('staff.organization_id', organizationId)
      .groupBy('degree_name')
      .select('degree_name', db.raw('COUNT(staff_qualifications.id) as count'));

    // 6. Total Payroll Gross Amount
    const salarySum = await db('staff_salary')
      .join('staff', 'staff_salary.staff_id', 'staff.id')
      .where('staff.organization_id', organizationId)
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
          totalGross: salarySum.totalGross || 0,
          totalNet: salarySum.totalNet || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
