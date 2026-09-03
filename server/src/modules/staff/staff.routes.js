const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../../database/knex');

// Helper to assemble detailed staff object
async function getDetailedStaffById(id, organizationId) {
  const staff = await db('staff')
    .where('staff.id', id)
    .andWhere('staff.organization_id', organizationId)
    .first();

  if (!staff) return null;

  const profile = await db('staff_profiles').where('staff_id', id).first();
  const addresses = await db('staff_addresses').where('staff_id', id);
  const employment = await db('staff_employment').where('staff_id', id).first();
  const qualifications = await db('staff_qualifications').where('staff_id', id).orderBy('passing_year', 'desc');
  const experiences = await db('staff_experiences').where('staff_id', id).orderBy('start_date', 'desc');
  
  const subjects = await db('staff_subjects')
    .join('subjects', 'staff_subjects.subject_id', 'subjects.id')
    .where('staff_subjects.staff_id', id)
    .select('staff_subjects.*', 'subjects.name as subject_name', 'subjects.code as subject_code', 'subjects.credits');

  const salary = await db('staff_salary').where('staff_id', id).first();
  const increments = await db('staff_increments').where('staff_id', id).orderBy('increment_date', 'desc');

  const leaveBalances = await db('staff_leave_balance')
    .join('leave_types', 'staff_leave_balance.leave_type_id', 'leave_types.id')
    .where('staff_leave_balance.staff_id', id)
    .select('staff_leave_balance.*', 'leave_types.name as leave_name', 'leave_types.code as leave_code');

  const documents = await db('staff_documents').where('staff_id', id).orderBy('created_at', 'desc');
  const remarks = await db('staff_remarks').where('staff_id', id).orderBy('created_at', 'desc');

  const department = await db('departments').where('id', staff.department_id).first();
  const designation = await db('designations').where('id', staff.designation_id).first();
  const campus = await db('campuses').where('id', staff.campus_id).first();
  const institute = await db('institutes').where('id', staff.institute_id).first();

  return {
    ...staff,
    profile,
    addresses,
    employment,
    qualifications,
    experiences,
    subjects,
    salary,
    increments,
    leaveBalances,
    documents,
    remarks,
    department,
    designation,
    campus,
    institute,
  };
}

// GET /api/v1/staff - Filterable & Paginated staff list
router.get('/', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const { campusId, instituteId, staffType, departmentId, designationId, status, search, page = 1, limit = 20 } = req.query;

    // Use query param or header tenant scope if provided
    const filterCampusId = campusId || req.query.campus_id || req.headers['x-campus-id'];
    const filterInstituteId = instituteId || req.query.institute_id || req.headers['x-institute-id'];

    let query = db('staff')
      .join('staff_profiles', 'staff.id', 'staff_profiles.staff_id')
      .join('departments', 'staff.department_id', 'departments.id')
      .join('designations', 'staff.designation_id', 'designations.id')
      .where('staff.organization_id', organizationId)
      .select(
        'staff.*',
        'staff_profiles.first_name',
        'staff_profiles.middle_name',
        'staff_profiles.last_name',
        'staff_profiles.official_email',
        'staff_profiles.official_mobile',
        'staff_profiles.photo_url',
        'departments.name as department_name',
        'departments.code as department_code',
        'designations.name as designation_name',
        'designations.code as designation_code'
      );

    if (filterCampusId && filterCampusId !== 'all') {
      query = query.where('staff.campus_id', filterCampusId);
    }

    if (filterInstituteId && filterInstituteId !== 'all') {
      query = query.where('staff.institute_id', filterInstituteId);
    }

    if (staffType) {
      query = query.where('staff.staff_type', staffType);
    }
    if (departmentId) {
      query = query.where('staff.department_id', departmentId);
    }
    if (designationId) {
      query = query.where('staff.designation_id', designationId);
    }
    if (status) {
      query = query.where('staff.status', status);
    }
    if (search) {
      const s = `%${search.toLowerCase()}%`;
      query = query.where(function () {
        this.whereRaw('LOWER(staff_profiles.first_name) LIKE ?', [s])
          .orWhereRaw('LOWER(staff_profiles.last_name) LIKE ?', [s])
          .orWhereRaw('LOWER(staff.employee_code) LIKE ?', [s])
          .orWhereRaw('LOWER(staff_profiles.official_email) LIKE ?', [s]);
      });
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const staffList = await query.offset(offset).limit(parseInt(limit, 10)).orderBy('staff.created_at', 'desc');

    res.json({
      success: true,
      data: staffList,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        count: staffList.length,
      },
    });
  } catch (err) {
    console.error('Error fetching staff list:', err);
    next(err);
  }
});

// GET /api/v1/staff/:id - Detailed Staff Profile
router.get('/:id', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const staffData = await getDetailedStaffById(req.params.id, organizationId);
    if (!staffData) {
      return res.status(404).json({ success: false, message: 'Staff record not found.' });
    }
    res.json({ success: true, data: staffData });
  } catch (err) {
    console.error('Error fetching staff detail:', err);
    next(err);
  }
});

// POST /api/v1/staff - Add New Staff (Wizard Submission)
router.post('/', async (req, res, next) => {
  try {
    const { organizationId, campusId, instituteId } = req.tenant;
    const body = req.body;

    const staffId = `stf-${uuidv4().slice(0, 8)}`;
    const employeeCode = body.employeeCode || `EMP-${Date.now().toString().slice(-4)}`;

    // Validate or resolve default department and designation if not provided
    let departmentId = body.departmentId;
    if (!departmentId) {
      const defaultDept = await db('departments').first();
      departmentId = defaultDept ? defaultDept.id : 'dept-cse-01';
    }

    let designationId = body.designationId;
    if (!designationId) {
      const defaultDesig = await db('designations').first();
      designationId = defaultDesig ? defaultDesig.id : 'desig-03';
    }

    // Map campus_id and institute_id directly from selected department for 100% data integrity
    let targetCampusId = body.campusId || campusId;
    let targetInstituteId = body.instituteId || instituteId;

    if (departmentId) {
      const deptMap = await db('departments')
        .join('institutes', 'departments.institute_id', 'institutes.id')
        .select('departments.institute_id', 'institutes.campus_id')
        .where('departments.id', departmentId)
        .first();

      if (deptMap) {
        targetInstituteId = deptMap.institute_id;
        targetCampusId = deptMap.campus_id;
      }
    }

    await db.transaction(async (trx) => {
      // 1. Staff table
      await trx('staff').insert({
        id: staffId,
        organization_id: organizationId,
        campus_id: targetCampusId,
        institute_id: targetInstituteId,
        department_id: departmentId,
        designation_id: designationId,
        employee_code: employeeCode,
        staff_type: body.staffType || 'TEACHING',
        status: 'ACTIVE',
      });

      // 2. Profile
      await trx('staff_profiles').insert({
        id: `prof-${uuidv4().slice(0, 8)}`,
        staff_id: staffId,
        photo_url: body.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        first_name: body.firstName || 'Faculty',
        middle_name: body.middleName || '',
        last_name: body.lastName || 'Member',
        gender: body.gender || 'MALE',
        date_of_birth: body.dateOfBirth || '1990-01-01',
        blood_group: body.bloodGroup || 'O+',
        official_email: body.officialEmail || `${employeeCode.toLowerCase()}@apexeducation.org`,
        personal_email: body.personalEmail || '',
        official_mobile: body.officialMobile || '+91 98200 00000',
        personal_mobile: body.personalMobile || '',
      });

      // 3. Address
      await trx('staff_addresses').insert({
        id: `addr-${uuidv4().slice(0, 8)}`,
        staff_id: staffId,
        address_type: 'PERMANENT',
        address_line_1: body.addressLine1 || 'Campus Residence',
        address_line_2: body.addressLine2 || '',
        city: body.city || 'Mumbai',
        state: body.state || 'Maharashtra',
        country: 'India',
        pincode: body.pincode || '400001',
      });

      // 4. Employment
      await trx('staff_employment').insert({
        id: `emp-${uuidv4().slice(0, 8)}`,
        staff_id: staffId,
        joining_date: body.joiningDate || new Date().toISOString().split('T')[0],
        employment_type: body.employmentType || 'PERMANENT',
        employee_status: 'ACTIVE',
        work_location: body.workLocation || 'Main Academic Building',
      });

      // 5. Qualification if provided
      if (body.degreeName) {
        await trx('staff_qualifications').insert({
          id: `sq-${uuidv4().slice(0, 8)}`,
          staff_id: staffId,
          degree_name: body.degreeName,
          institution: body.institution || 'Recognized University',
          specialization: body.specialization || '',
          passing_year: body.passingYear ? parseInt(body.passingYear, 10) : 2020,
          grade: body.grade || 'First Class',
          percentage: body.percentage ? parseFloat(body.percentage) : 80.0,
        });
      }

      // 6. Salary if provided
      if (body.basicSalary) {
        const basic = parseFloat(body.basicSalary);
        const hra = basic * 0.3;
        const special = basic * 0.15;
        const gross = basic + hra + special;
        const net = gross - (basic * 0.1);

        await trx('staff_salary').insert({
          id: `sal-${uuidv4().slice(0, 8)}`,
          staff_id: staffId,
          basic_salary: basic,
          hra,
          special_allowance: special,
          gross_salary: gross,
          deductions: basic * 0.1,
          net_salary: net,
          effective_from: body.joiningDate || new Date().toISOString().split('T')[0],
        });
      }

      // 7. Audit log
      await trx('audit_logs').insert({
        id: `log-${uuidv4().slice(0, 8)}`,
        organization_id: organizationId,
        user_id: req.user?.id || 'admin',
        action: 'CREATE',
        entity_type: 'STAFF',
        entity_id: staffId,
        new_values: JSON.stringify({ employeeCode, firstName: body.firstName, lastName: body.lastName }),
        ip_address: req.ip || '127.0.0.1',
      });
    });

    const newStaff = await getDetailedStaffById(staffId, organizationId);
    console.log('[CampusAUM Staff API]: Created staff member successfully in PostgreSQL:', staffId);
    res.status(201).json({ success: true, message: 'Staff record created successfully.', data: newStaff });
  } catch (err) {
    console.error('Error creating staff member in PostgreSQL:', err);
    next(err);
  }
});

// PATCH /api/v1/staff/:id/status - Change status (Deactivate / Reactivate)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const { status } = req.body; // ACTIVE, INACTIVE, RESIGNED, ON_LEAVE

    await db('staff')
      .where('id', req.params.id)
      .andWhere('organization_id', organizationId)
      .update({ status, updated_at: db.fn.now() });

    await db('audit_logs').insert({
      id: `log-${uuidv4().slice(0, 8)}`,
      organization_id: organizationId,
      user_id: req.user?.id || 'admin',
      action: 'STATUS_CHANGE',
      entity_type: 'STAFF',
      entity_id: req.params.id,
      new_values: JSON.stringify({ status }),
    });

    res.json({ success: true, message: `Staff status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating staff status:', err);
    next(err);
  }
});

function formatDMY(dateInput) {
  if (!dateInput) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  if (typeof dateInput === 'string' && dateInput.includes('-') && dateInput.split('-')[0].length === 4) {
    const [y, m, d] = dateInput.split('T')[0].split('-');
    return `${d}-${m}-${y}`;
  }
  return dateInput;
}

// POST /api/v1/staff/:id/remarks - Add evaluation remark
router.post('/:id/remarks', async (req, res, next) => {
  try {
    const { remarkType, remark, rating, createdByName, date } = req.body;
    const todayDMY = formatDMY(date);
    const finalRemark = (remark && (remark.startsWith('[') || remark.includes(todayDMY)))
      ? remark
      : `[Date: ${todayDMY}] ${remark}`;

    const remarkId = `rem-${uuidv4().slice(0, 8)}`;
    await db('staff_remarks').insert({
      id: remarkId,
      staff_id: req.params.id,
      remark_type: remarkType || 'REPORTING_AUTHORITY',
      remark: finalRemark,
      rating: rating || 'GOOD',
      created_by: req.user?.id || 'admin',
      created_by_name: createdByName || 'Institutional Authority',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    res.status(201).json({ success: true, message: 'Evaluation remark added.' });
  } catch (err) {
    console.error('Error adding remark:', err);
    next(err);
  }
});

// POST /api/v1/staff/:id/documents - Upload document record
router.post('/:id/documents', async (req, res, next) => {
  try {
    const { documentType, documentName, fileUrl, fileSize } = req.body;

    const docId = `doc-${uuidv4().slice(0, 8)}`;
    await db('staff_documents').insert({
      id: docId,
      staff_id: req.params.id,
      document_type: documentType || 'OTHER',
      document_name: documentName || 'Institutional_Document.pdf',
      file_url: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: fileSize || 154000,
      uploaded_by: req.user?.email || 'HR Administrator',
    });

    res.status(201).json({ success: true, message: 'Document registered successfully.' });
  } catch (err) {
    console.error('Error registering document:', err);
    next(err);
  }
});

// POST /api/v1/staff/:id/increments - Add salary increment
router.post('/:id/increments', async (req, res, next) => {
  try {
    const { previousSalary, incrementAmount, newSalary, incrementDate, reason, approvedBy } = req.body;

    await db.transaction(async (trx) => {
      await trx('staff_increments').insert({
        id: `inc-${uuidv4().slice(0, 8)}`,
        staff_id: req.params.id,
        previous_salary: previousSalary,
        increment_amount: incrementAmount,
        new_salary: newSalary,
        increment_date: incrementDate || new Date().toISOString().split('T')[0],
        reason: reason || 'Annual Performance Appraisal',
        approved_by: approvedBy || 'Principal / HR Committee',
      });

      await trx('staff_salary')
        .where('staff_id', req.params.id)
        .update({
          gross_salary: newSalary,
          basic_salary: newSalary * 0.65,
          net_salary: newSalary * 0.9,
          effective_from: incrementDate || new Date().toISOString().split('T')[0],
          updated_at: db.fn.now(),
        });
    });

    res.status(201).json({ success: true, message: 'Salary increment applied successfully.' });
  } catch (err) {
    console.error('Error applying salary increment:', err);
    next(err);
  }
});

module.exports = router;
