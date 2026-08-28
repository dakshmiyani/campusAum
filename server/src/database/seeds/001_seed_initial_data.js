const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Clear existing tables
  await knex('departments').update({ hod_staff_id: null });
  await knex('audit_logs').del();
  await knex('staff_remarks').del();
  await knex('staff_documents').del();
  await knex('staff_leave_balance').del();
  await knex('leave_types').del();
  await knex('staff_increments').del();
  await knex('staff_salary').del();
  await knex('staff_subjects').del();
  await knex('subjects').del();
  await knex('staff_experiences').del();
  await knex('staff_qualifications').del();
  await knex('staff_employment').del();
  await knex('staff_addresses').del();
  await knex('staff_profiles').del();
  await knex('staff').del();
  await knex('users').del();
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();
  await knex('qualifications').del();
  await knex('designations').del();
  await knex('departments').del();
  await knex('institutes').del();
  await knex('campuses').del();
  await knex('organizations').del();

  // 1. Organization / Trust
  const orgId = 'org-apex-01';
  await knex('organizations').insert([
    {
      id: orgId,
      name: 'Apex Education Foundation & Trust',
      code: 'APEX-TRUST',
      slug: 'apex-education',
      logo_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
      email: 'contact@apexeducation.org',
      phone: '+91 22 2847 9000',
      address: 'Apex Knowledge Towers, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
      status: 'ACTIVE',
    },
  ]);

  // 2. Campuses
  const campus1Id = 'campus-main-01';
  const campus2Id = 'campus-tech-02';
  await knex('campuses').insert([
    {
      id: campus1Id,
      organization_id: orgId,
      name: 'Apex Main Campus',
      code: 'CAMPUS-MAIN',
      address: 'Sector 15, Vashi, Navi Mumbai',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400703',
      status: 'ACTIVE',
    },
    {
      id: campus2Id,
      organization_id: orgId,
      name: 'Apex Tech City Campus',
      code: 'CAMPUS-TECH',
      address: 'Kalyani Nagar, Pune',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411006',
      status: 'ACTIVE',
    },
  ]);

  // 3. Institutes
  const inst1Id = 'inst-iet-01';
  const inst2Id = 'inst-ims-02';
  const inst3Id = 'inst-coe-03';
  await knex('institutes').insert([
    {
      id: inst1Id,
      campus_id: campus1Id,
      name: 'Apex Institute of Engineering & Technology',
      code: 'AIET',
      type: 'ENGINEERING',
      address: 'Sector 15, Vashi, Navi Mumbai',
      status: 'ACTIVE',
    },
    {
      id: inst2Id,
      campus_id: campus1Id,
      name: 'Apex Institute of Management Studies',
      code: 'AIMS',
      type: 'MANAGEMENT',
      address: 'Sector 15, Vashi, Navi Mumbai',
      status: 'ACTIVE',
    },
    {
      id: inst3Id,
      campus_id: campus2Id,
      name: 'Apex College of Engineering (Pune)',
      code: 'ACEP',
      type: 'ENGINEERING',
      address: 'Kalyani Nagar, Pune',
      status: 'ACTIVE',
    },
  ]);

  // 4. Departments
  const deptCSE = 'dept-cse-01';
  const deptIT = 'dept-it-02';
  const deptECE = 'dept-ece-03';
  const deptMech = 'dept-mech-04';
  const deptMBA = 'dept-mba-05';
  const deptAdmin = 'dept-admin-06';

  await knex('departments').insert([
    {
      id: deptCSE,
      institute_id: inst1Id,
      name: 'Computer Engineering & AI',
      code: 'CSE',
      description: 'Department of Computer Science, Software Engineering and Artificial Intelligence.',
      status: 'ACTIVE',
    },
    {
      id: deptIT,
      institute_id: inst1Id,
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology and Cloud Systems.',
      status: 'ACTIVE',
    },
    {
      id: deptECE,
      institute_id: inst1Id,
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of Electronics, VLSI & IoT Hardware.',
      status: 'ACTIVE',
    },
    {
      id: deptMech,
      institute_id: inst1Id,
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department of Mechanical & Mechatronics Engineering.',
      status: 'ACTIVE',
    },
    {
      id: deptMBA,
      institute_id: inst2Id,
      name: 'Business Analytics & MBA',
      code: 'MBA',
      description: 'Department of School of Management.',
      status: 'ACTIVE',
    },
    {
      id: deptAdmin,
      institute_id: inst1Id,
      name: 'General Administration & Operations',
      code: 'ADMIN',
      description: 'Central campus administration, office support & logistics.',
      status: 'ACTIVE',
    },
  ]);

  // 5. Designations
  const desigProf = 'desig-01';
  const desigAssocProf = 'desig-02';
  const desigAsstProf = 'desig-03';
  const desigLecturer = 'desig-04';
  const desigHod = 'desig-05';
  const desigPrincipal = 'desig-06';
  const desigLabAsst = 'desig-07';
  const desigClerk = 'desig-08';
  const desigAccountant = 'desig-09';

  await knex('designations').insert([
    { id: desigPrincipal, organization_id: orgId, name: 'Principal / Director', code: 'PRIN', level: 1, description: 'Academic Head of Institute' },
    { id: desigHod, organization_id: orgId, name: 'Head of Department (HOD)', code: 'HOD', level: 2, description: 'Department Academic Lead' },
    { id: desigProf, organization_id: orgId, name: 'Professor', code: 'PROF', level: 2, description: 'Senior Academic Professor' },
    { id: desigAssocProf, organization_id: orgId, name: 'Associate Professor', code: 'ASSOC_PROF', level: 3, description: 'Tenured Academic Faculty' },
    { id: desigAsstProf, organization_id: orgId, name: 'Assistant Professor', code: 'ASST_PROF', level: 4, description: 'Academic Teaching Faculty' },
    { id: desigLecturer, organization_id: orgId, name: 'Lecturer', code: 'LECT', level: 5, description: 'Junior Teaching Faculty' },
    { id: desigLabAsst, organization_id: orgId, name: 'Senior Lab Assistant', code: 'LAB_ASST', level: 5, description: 'Technical Laboratory Specialist' },
    { id: desigClerk, organization_id: orgId, name: 'Senior Executive Clerk', code: 'CLERK', level: 6, description: 'Administrative Office Officer' },
    { id: desigAccountant, organization_id: orgId, name: 'Senior Accountant', code: 'ACCT', level: 5, description: 'Finance & Payroll Officer' },
  ]);

  // 6. Qualifications Registry
  const qualPhD = 'qual-01';
  const qualMTech = 'qual-02';
  const qualBE = 'qual-03';
  const qualMBA = 'qual-04';
  const qualBSc = 'qual-05';

  await knex('qualifications').insert([
    { id: qualPhD, name: 'Doctor of Philosophy (Ph.D.)', level: 'DOCTORATE', specialization: 'Computer Science & Artificial Intelligence' },
    { id: qualMTech, name: 'Master of Technology (M.Tech)', level: 'POST_GRADUATE', specialization: 'Computer Engineering' },
    { id: qualBE, name: 'Bachelor of Engineering (B.E. / B.Tech)', level: 'UNDER_GRADUATE', specialization: 'Information Technology' },
    { id: qualMBA, name: 'Master of Business Administration (MBA)', level: 'POST_GRADUATE', specialization: 'Operations & HR' },
    { id: qualBSc, name: 'Bachelor of Science (B.Sc)', level: 'UNDER_GRADUATE', specialization: 'Computer Science' },
  ]);

  // 7. Roles & Permissions (RBAC)
  const roleAdmin = 'role-admin-01';
  const roleHr = 'role-hr-02';
  const rolePrincipal = 'role-principal-03';
  const roleStaff = 'role-staff-04';

  await knex('roles').insert([
    { id: roleAdmin, organization_id: orgId, name: 'ORGANIZATION_ADMIN', description: 'Full system administration across all campuses' },
    { id: roleHr, organization_id: orgId, name: 'HR', description: 'Staff profiling, employment, salary and document management' },
    { id: rolePrincipal, organization_id: orgId, name: 'PRINCIPAL', description: 'Academic overview, remarks, evaluation & institutional reports' },
    { id: roleStaff, organization_id: orgId, name: 'STAFF', description: 'Self-service profile and leave view access' },
  ]);

  const permissions = [
    { id: 'p-1', code: 'staff.view', module: 'staff', description: 'View staff directory and profiles' },
    { id: 'p-2', code: 'staff.create', module: 'staff', description: 'Add new staff members' },
    { id: 'p-3', code: 'staff.update', module: 'staff', description: 'Edit staff profile information' },
    { id: 'p-4', code: 'staff.delete', module: 'staff', description: 'Deactivate staff records' },
    { id: 'p-5', code: 'staff.salary.view', module: 'staff', description: 'View confidential staff salary & increments' },
    { id: 'p-6', code: 'staff.salary.manage', module: 'staff', description: 'Update salary and grant increments' },
    { id: 'p-7', code: 'staff.documents.upload', module: 'staff', description: 'Upload staff certificates & documents' },
    { id: 'p-8', code: 'staff.remarks.create', module: 'staff', description: 'Add official evaluation remarks' },
    { id: 'p-9', code: 'department.manage', module: 'department', description: 'Manage departments and HOD allocations' },
    { id: 'p-10', code: 'subject.manage', module: 'subject', description: 'Allocate subjects to faculty' },
  ];
  await knex('permissions').insert(permissions);

  for (const p of permissions) {
    await knex('role_permissions').insert({ role_id: roleAdmin, permission_id: p.id });
    await knex('role_permissions').insert({ role_id: roleHr, permission_id: p.id });
  }

  // 8. Users
  const passwordHash = await bcrypt.hash('CampusAum@2026', 10);

  const userIdAdmin = 'usr-admin-01';
  const userIdRahul = 'usr-rahul-02';
  const userIdNeha = 'usr-neha-03';
  const userIdAmit = 'usr-amit-04';

  await knex('users').insert([
    { id: userIdAdmin, organization_id: orgId, email: 'admin@campusaum.edu', password_hash: passwordHash, role_id: roleAdmin, is_active: true },
    { id: userIdRahul, organization_id: orgId, email: 'rahul.sharma@apexeducation.org', password_hash: passwordHash, role_id: roleAdmin, is_active: true },
    { id: userIdNeha, organization_id: orgId, email: 'neha.kulkarni@apexeducation.org', password_hash: passwordHash, role_id: roleStaff, is_active: true },
    { id: userIdAmit, organization_id: orgId, email: 'amit.verma@apexeducation.org', password_hash: passwordHash, role_id: roleStaff, is_active: true },
  ]);

  // 9. Leave Types
  const leaveCasual = 'lt-01';
  const leaveMedical = 'lt-02';
  const leaveEarned = 'lt-03';

  await knex('leave_types').insert([
    { id: leaveCasual, organization_id: orgId, name: 'Casual Leave (CL)', code: 'CL', default_days: 12 },
    { id: leaveMedical, organization_id: orgId, name: 'Medical Leave (ML)', code: 'ML', default_days: 10 },
    { id: leaveEarned, organization_id: orgId, name: 'Earned / Academic Leave (EL)', code: 'EL', default_days: 15 },
  ]);

  // 10. Subjects Master Data
  const subAI = 'sub-ai-01';
  const subDS = 'sub-ds-02';
  const subCloud = 'sub-cloud-03';
  const subDBMS = 'sub-dbms-04';
  const subVLSI = 'sub-vlsi-05';

  await knex('subjects').insert([
    { id: subAI, institute_id: inst1Id, code: 'CS-701', name: 'Artificial Intelligence & Machine Learning', credits: 4, semester: 7, status: 'ACTIVE' },
    { id: subDS, institute_id: inst1Id, code: 'CS-302', name: 'Data Structures & Algorithms', credits: 4, semester: 3, status: 'ACTIVE' },
    { id: subCloud, institute_id: inst1Id, code: 'IT-604', name: 'Cloud Computing & Distributed Architecture', credits: 3, semester: 6, status: 'ACTIVE' },
    { id: subDBMS, institute_id: inst1Id, code: 'CS-401', name: 'Database Management Systems & SQL', credits: 4, semester: 4, status: 'ACTIVE' },
    { id: subVLSI, institute_id: inst1Id, code: 'EC-503', name: 'VLSI Circuit Design', credits: 3, semester: 5, status: 'ACTIVE' },
  ]);

  // 11. Staff Records (4 Detailed Profiles)
  // Staff 1: Dr. Rahul Sharma (Professor & HOD, Computer Engg)
  const staff1Id = 'stf-1001';
  await knex('staff').insert({
    id: staff1Id,
    user_id: userIdRahul,
    organization_id: orgId,
    campus_id: campus1Id,
    institute_id: inst1Id,
    department_id: deptCSE,
    designation_id: desigProf,
    employee_code: 'EMP-CSE-001',
    staff_type: 'TEACHING',
    status: 'ACTIVE',
  });

  // Set Dr. Rahul Sharma as HOD of CSE
  await knex('departments').where('id', deptCSE).update({ hod_staff_id: staff1Id });

  await knex('staff_profiles').insert({
    id: 'prof-1001',
    staff_id: staff1Id,
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    first_name: 'Rahul',
    middle_name: 'Chandra',
    last_name: 'Sharma',
    gender: 'MALE',
    date_of_birth: '1982-04-14',
    blood_group: 'O+',
    official_email: 'rahul.sharma@apexeducation.org',
    personal_email: 'rahul.sharma.phd@gmail.com',
    official_mobile: '+91 98201 12345',
    personal_mobile: '+91 98201 98765',
  });

  await knex('staff_addresses').insert([
    {
      id: 'addr-1001-p',
      staff_id: staff1Id,
      address_type: 'PERMANENT',
      address_line_1: 'Flat 602, Orchid Heights',
      address_line_2: 'Palm Beach Road, Sanpada',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400705',
    },
    {
      id: 'addr-1001-c',
      staff_id: staff1Id,
      address_type: 'CORRESPONDENCE',
      address_line_1: 'Flat 602, Orchid Heights',
      address_line_2: 'Palm Beach Road, Sanpada',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400705',
    },
  ]);

  await knex('staff_employment').insert({
    id: 'emp-1001',
    staff_id: staff1Id,
    joining_date: '2014-06-15',
    confirmation_date: '2015-06-15',
    employment_type: 'PERMANENT',
    employee_status: 'ACTIVE',
    retirement_date: '2042-04-30',
    work_location: 'AIET Main Building, Room 304',
  });

  await knex('staff_qualifications').insert([
    {
      id: 'sq-1001-1',
      staff_id: staff1Id,
      qualification_id: qualPhD,
      degree_name: 'Ph.D. in Computer Science & AI',
      institution: 'Indian Institute of Technology (IIT) Bombay',
      specialization: 'Deep Neural Networks & Machine Learning',
      passing_year: 2013,
      grade: 'First Class with Distinction',
      percentage: 92.5,
      certificate_url: 'https://cdn.campusaum.org/docs/rahul_phd_certificate.pdf',
    },
    {
      id: 'sq-1001-2',
      staff_id: staff1Id,
      qualification_id: qualMTech,
      degree_name: 'M.Tech in Computer Engineering',
      institution: 'VJTI Mumbai',
      specialization: 'Software Engineering',
      passing_year: 2008,
      grade: 'Distinction',
      percentage: 88.0,
      certificate_url: 'https://cdn.campusaum.org/docs/rahul_mtech.pdf',
    },
    {
      id: 'sq-1001-3',
      staff_id: staff1Id,
      qualification_id: qualBE,
      degree_name: 'B.E. in Computer Science',
      institution: 'University of Mumbai',
      specialization: 'Computer Engineering',
      passing_year: 2005,
      grade: 'First Class',
      percentage: 78.4,
      certificate_url: 'https://cdn.campusaum.org/docs/rahul_be.pdf',
    },
  ]);

  await knex('staff_experiences').insert([
    {
      id: 'exp-1001-1',
      staff_id: staff1Id,
      organization_name: 'Tata Consultancy Services (TCS Innovation Labs)',
      designation: 'Senior Lead Research Associate',
      employment_type: 'FULL_TIME',
      start_date: '2008-07-01',
      end_date: '2014-05-30',
      is_current: false,
      description: 'Led advanced AI research algorithms and pattern recognition pipelines for institutional analytics.',
      experience_certificate_url: 'https://cdn.campusaum.org/docs/rahul_tcs_exp.pdf',
    },
  ]);

  await knex('staff_subjects').insert([
    { id: 'ss-1001-1', staff_id: staff1Id, subject_id: subAI, academic_year: '2026-2027', semester: 7, section: 'A' },
    { id: 'ss-1001-2', staff_id: staff1Id, subject_id: subDS, academic_year: '2026-2027', semester: 3, section: 'B' },
  ]);

  await knex('staff_salary').insert({
    id: 'sal-1001',
    staff_id: staff1Id,
    basic_salary: 135000,
    hra: 40500,
    special_allowance: 24500,
    gross_salary: 200000,
    deductions: 18000,
    net_salary: 182000,
    effective_from: '2025-04-01',
  });

  await knex('staff_increments').insert([
    {
      id: 'inc-1001-1',
      staff_id: staff1Id,
      previous_salary: 180000,
      increment_amount: 20000,
      new_salary: 200000,
      increment_date: '2025-04-01',
      reason: 'Annual Performance Review & HOD Promotion Appraisal',
      approved_by: 'Dr. S. K. Mehta (Principal)',
    },
  ]);

  await knex('staff_leave_balance').insert([
    { id: 'lb-1001-1', staff_id: staff1Id, leave_type_id: leaveCasual, year: 2026, allocated: 12, used: 3, remaining: 9 },
    { id: 'lb-1001-2', staff_id: staff1Id, leave_type_id: leaveMedical, year: 2026, allocated: 10, used: 1, remaining: 9 },
    { id: 'lb-1001-3', staff_id: staff1Id, leave_type_id: leaveEarned, year: 2026, allocated: 15, used: 4, remaining: 11 },
  ]);

  await knex('staff_documents').insert([
    {
      id: 'doc-1001-1',
      staff_id: staff1Id,
      document_type: 'DEGREE_CERTIFICATE',
      document_name: 'PhD_Doctorate_Degree_IIT_Bombay.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 245000,
      uploaded_by: 'HR Admin',
    },
    {
      id: 'doc-1001-2',
      staff_id: staff1Id,
      document_type: 'AADHAAR',
      document_name: 'Aadhaar_Card_Rahul_Sharma.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 118000,
      uploaded_by: 'HR Admin',
    },
    {
      id: 'doc-1001-3',
      staff_id: staff1Id,
      document_type: 'JOINING_LETTER',
      document_name: 'Apex_Appointment_Letter_Prof.pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: 195000,
      uploaded_by: 'HR Admin',
    },
  ]);

  await knex('staff_remarks').insert([
    {
      id: 'rem-1001-1',
      staff_id: staff1Id,
      remark_type: 'PRINCIPAL',
      remark: 'Exceptional academic leadership as HOD. Published 5 Scopus-indexed research papers in 2025 and secured NBA accreditation for CSE department.',
      rating: 'OUTSTANDING',
      created_by: userIdAdmin,
      created_by_name: 'Dr. S. K. Mehta (Principal)',
    },
    {
      id: 'rem-1001-2',
      staff_id: staff1Id,
      remark_type: 'REPORTING_AUTHORITY',
      remark: 'Highly committed faculty member with outstanding student feedback scores (4.9/5.0).',
      rating: 'OUTSTANDING',
      created_by: userIdAdmin,
      created_by_name: 'Dean of Academics',
    },
  ]);

  // Staff 2: Prof. Neha Kulkarni (Associate Professor, IT)
  const staff2Id = 'stf-1002';
  await knex('staff').insert({
    id: staff2Id,
    user_id: userIdNeha,
    organization_id: orgId,
    campus_id: campus1Id,
    institute_id: inst1Id,
    department_id: deptIT,
    designation_id: desigAssocProf,
    employee_code: 'EMP-IT-004',
    staff_type: 'TEACHING',
    status: 'ACTIVE',
  });

  await knex('staff_profiles').insert({
    id: 'prof-1002',
    staff_id: staff2Id,
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    first_name: 'Neha',
    middle_name: 'Vikram',
    last_name: 'Kulkarni',
    gender: 'FEMALE',
    date_of_birth: '1987-11-20',
    blood_group: 'B+',
    official_email: 'neha.kulkarni@apexeducation.org',
    personal_email: 'neha.kulkarni.tech@gmail.com',
    official_mobile: '+91 98202 23456',
    personal_mobile: '+91 98202 87654',
  });

  await knex('staff_addresses').insert({
    id: 'addr-1002-p',
    staff_id: staff2Id,
    address_type: 'PERMANENT',
    address_line_1: 'B-403, Sun City Complex',
    address_line_2: 'Seawoods, Nerul',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400706',
  });

  await knex('staff_employment').insert({
    id: 'emp-1002',
    staff_id: staff2Id,
    joining_date: '2017-08-10',
    confirmation_date: '2018-08-10',
    employment_type: 'PERMANENT',
    employee_status: 'ACTIVE',
    work_location: 'IT Wing, Room 201',
  });

  await knex('staff_qualifications').insert([
    {
      id: 'sq-1002-1',
      staff_id: staff2Id,
      qualification_id: qualMTech,
      degree_name: 'M.Tech in Information Technology',
      institution: 'COEP Pune',
      specialization: 'Distributed Systems & Cloud Systems',
      passing_year: 2011,
      grade: 'First Class with Distinction',
      percentage: 85.2,
    },
    {
      id: 'sq-1002-2',
      staff_id: staff2Id,
      qualification_id: qualBE,
      degree_name: 'B.E. in Information Technology',
      institution: 'Pune University',
      specialization: 'Information Technology',
      passing_year: 2009,
      grade: 'First Class',
      percentage: 76.8,
    },
  ]);

  await knex('staff_subjects').insert([
    { id: 'ss-1002-1', staff_id: staff2Id, subject_id: subCloud, academic_year: '2026-2027', semester: 6, section: 'A' },
    { id: 'ss-1002-2', staff_id: staff2Id, subject_id: subDBMS, academic_year: '2026-2027', semester: 4, section: 'A' },
  ]);

  await knex('staff_salary').insert({
    id: 'sal-1002',
    staff_id: staff2Id,
    basic_salary: 95000,
    hra: 28500,
    special_allowance: 16500,
    gross_salary: 140000,
    deductions: 12000,
    net_salary: 128000,
    effective_from: '2025-04-01',
  });

  await knex('staff_leave_balance').insert([
    { id: 'lb-1002-1', staff_id: staff2Id, leave_type_id: leaveCasual, year: 2026, allocated: 12, used: 2, remaining: 10 },
    { id: 'lb-1002-2', staff_id: staff2Id, leave_type_id: leaveMedical, year: 2026, allocated: 10, used: 0, remaining: 10 },
    { id: 'lb-1002-3', staff_id: staff2Id, leave_type_id: leaveEarned, year: 2026, allocated: 15, used: 5, remaining: 10 },
  ]);

  // Staff 3: Mr. Amit Verma (Senior Administrative Officer, Non-Teaching)
  const staff3Id = 'stf-1003';
  await knex('staff').insert({
    id: staff3Id,
    user_id: userIdAmit,
    organization_id: orgId,
    campus_id: campus1Id,
    institute_id: inst1Id,
    department_id: deptAdmin,
    designation_id: desigClerk,
    employee_code: 'EMP-ADM-012',
    staff_type: 'NON_TEACHING',
    status: 'ACTIVE',
  });

  await knex('staff_profiles').insert({
    id: 'prof-1003',
    staff_id: staff3Id,
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    first_name: 'Amit',
    middle_name: 'Kumar',
    last_name: 'Verma',
    gender: 'MALE',
    date_of_birth: '1990-06-25',
    blood_group: 'A+',
    official_email: 'amit.verma@apexeducation.org',
    personal_email: 'amit.verma.admin@gmail.com',
    official_mobile: '+91 98203 34567',
    personal_mobile: '+91 98203 76543',
  });

  await knex('staff_addresses').insert({
    id: 'addr-1003-p',
    staff_id: staff3Id,
    address_type: 'PERMANENT',
    address_line_1: 'A-101, Shanti Vihar',
    address_line_2: 'Kharghar Sector 12',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '410210',
  });

  await knex('staff_employment').insert({
    id: 'emp-1003',
    staff_id: staff3Id,
    joining_date: '2019-02-01',
    confirmation_date: '2019-08-01',
    employment_type: 'PERMANENT',
    employee_status: 'ACTIVE',
    work_location: 'Central Admin Office, Ground Floor',
  });

  await knex('staff_qualifications').insert({
    id: 'sq-1003-1',
    staff_id: staff3Id,
    qualification_id: qualMBA,
    degree_name: 'Master of Business Administration (MBA)',
    institution: 'Mumbai University',
    specialization: 'HR & Educational Administration',
    passing_year: 2014,
    grade: 'First Class',
    percentage: 74.5,
  });

  await knex('staff_salary').insert({
    id: 'sal-1003',
    staff_id: staff3Id,
    basic_salary: 55000,
    hra: 16500,
    special_allowance: 8500,
    gross_salary: 80000,
    deductions: 6000,
    net_salary: 74000,
    effective_from: '2025-04-01',
  });

  await knex('staff_leave_balance').insert([
    { id: 'lb-1003-1', staff_id: staff3Id, leave_type_id: leaveCasual, year: 2026, allocated: 12, used: 1, remaining: 11 },
    { id: 'lb-1003-2', staff_id: staff3Id, leave_type_id: leaveMedical, year: 2026, allocated: 10, used: 2, remaining: 8 },
    { id: 'lb-1003-3', staff_id: staff3Id, leave_type_id: leaveEarned, year: 2026, allocated: 15, used: 3, remaining: 12 },
  ]);

  // 12. Initial Audit Logs
  await knex('audit_logs').insert([
    {
      id: 'log-01',
      organization_id: orgId,
      user_id: userIdAdmin,
      action: 'CREATE',
      entity_type: 'STAFF',
      entity_id: staff1Id,
      new_values: JSON.stringify({ employee_code: 'EMP-CSE-001', name: 'Dr. Rahul Sharma', status: 'ACTIVE' }),
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    {
      id: 'log-02',
      organization_id: orgId,
      user_id: userIdAdmin,
      action: 'UPDATE_SALARY',
      entity_type: 'SALARY',
      entity_id: staff1Id,
      old_values: JSON.stringify({ gross_salary: 180000 }),
      new_values: JSON.stringify({ gross_salary: 200000, increment: 20000 }),
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  ]);
};
