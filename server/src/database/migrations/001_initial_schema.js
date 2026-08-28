/**
 * Migration for CampusAUM Teacher Profiling v1 SaaS Architecture
 */

exports.up = async function (knex) {
  // 1. Organizations / Trusts
  await knex.schema.createTable('organizations', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('code').notNullable().unique();
    table.string('slug').notNullable().unique();
    table.string('logo_url');
    table.string('email');
    table.string('phone');
    table.string('address');
    table.string('status').defaultTo('ACTIVE'); // ACTIVE, INACTIVE
    table.timestamps(true, true);
  });

  // 2. Campuses
  await knex.schema.createTable('campuses', (table) => {
    table.string('id').primary();
    table.string('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('pincode');
    table.string('status').defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  // 3. Institutes
  await knex.schema.createTable('institutes', (table) => {
    table.string('id').primary();
    table.string('campus_id').notNullable().references('id').inTable('campuses').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.string('type').defaultTo('ENGINEERING'); // ENGINEERING, MANAGEMENT, SCIENCE, MEDICAL, ARTS
    table.string('address');
    table.string('status').defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  // 4. Departments
  await knex.schema.createTable('departments', (table) => {
    table.string('id').primary();
    table.string('institute_id').notNullable().references('id').inTable('institutes').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description');
    table.string('hod_staff_id'); // foreign key linked to staff table later or handled softly
    table.string('status').defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  // 5. Designations
  await knex.schema.createTable('designations', (table) => {
    table.string('id').primary();
    table.string('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.integer('level').defaultTo(1); // 1 = High rank (Principal/Professor), 5 = Junior
    table.text('description');
    table.string('status').defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  // 6. Master Qualifications Registry
  await knex.schema.createTable('qualifications', (table) => {
    table.string('id').primary();
    table.string('name').notNullable(); // e.g. Ph.D., M.Tech, B.E., MBA
    table.string('level').notNullable(); // DOCTORATE, POST_GRADUATE, UNDER_GRADUATE, DIPLOMA, CERTIFICATION
    table.string('specialization');
    table.timestamps(true, true);
  });

  // 7. Roles & Permissions (RBAC)
  await knex.schema.createTable('roles', (table) => {
    table.string('id').primary();
    table.string('organization_id'); // null for super admin role, specific for org roles
    table.string('name').notNullable(); // SUPER_ADMIN, ORGANIZATION_ADMIN, PRINCIPAL, HOD, HR, REPORTING_AUTHORITY, STAFF
    table.text('description');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('permissions', (table) => {
    table.string('id').primary();
    table.string('code').notNullable().unique(); // e.g., staff.view, staff.create, staff.salary.manage
    table.string('module').notNullable(); // staff, salary, department, document, report, settings
    table.string('description');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('role_permissions', (table) => {
    table.string('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.string('permission_id').notNullable().references('id').inTable('permissions').onDelete('CASCADE');
    table.primary(['role_id', 'permission_id']);
  });

  // 8. Users
  await knex.schema.createTable('users', (table) => {
    table.string('id').primary();
    table.string('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('role_id').references('id').inTable('roles');
    table.boolean('is_active').defaultTo(true);
    table.string('last_login_at');
    table.timestamps(true, true);
  });

  // 9. Staff (Central identity linked to Tenant context)
  await knex.schema.createTable('staff', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('campus_id').notNullable().references('id').inTable('campuses').onDelete('CASCADE');
    table.string('institute_id').notNullable().references('id').inTable('institutes').onDelete('CASCADE');
    table.string('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE');
    table.string('designation_id').notNullable().references('id').inTable('designations').onDelete('CASCADE');
    table.string('employee_code').notNullable().unique();
    table.string('staff_type').notNullable().defaultTo('TEACHING'); // TEACHING, NON_TEACHING
    table.string('status').defaultTo('ACTIVE'); // ACTIVE, INACTIVE, ON_LEAVE, RESIGNED, RETIRED
    table.timestamps(true, true);
  });

  // 10. Staff Profiles (Personal Details)
  await knex.schema.createTable('staff_profiles', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('photo_url');
    table.string('first_name').notNullable();
    table.string('middle_name');
    table.string('last_name').notNullable();
    table.string('gender').defaultTo('PREFER_NOT_TO_SAY'); // MALE, FEMALE, OTHER
    table.string('date_of_birth');
    table.string('blood_group');
    table.string('official_email').notNullable();
    table.string('personal_email');
    table.string('official_mobile').notNullable();
    table.string('personal_mobile');
    table.timestamps(true, true);
  });

  // 11. Staff Addresses (Permanent vs Correspondence)
  await knex.schema.createTable('staff_addresses', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('address_type').notNullable(); // PERMANENT, CORRESPONDENCE
    table.string('address_line_1').notNullable();
    table.string('address_line_2');
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('country').defaultTo('India');
    table.string('pincode').notNullable();
    table.timestamps(true, true);
  });

  // 12. Staff Employment Info
  await knex.schema.createTable('staff_employment', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('joining_date').notNullable();
    table.string('confirmation_date');
    table.string('employment_type').notNullable().defaultTo('PERMANENT'); // PERMANENT, CONTRACT, VISITING, TEMPORARY, PROBATION
    table.string('employee_status').defaultTo('ACTIVE');
    table.string('retirement_date');
    table.string('work_location');
    table.timestamps(true, true);
  });

  // 13. Staff Qualifications
  await knex.schema.createTable('staff_qualifications', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('qualification_id').references('id').inTable('qualifications');
    table.string('degree_name').notNullable(); // e.g. Ph.D. in Artificial Intelligence
    table.string('institution').notNullable();
    table.string('specialization');
    table.integer('passing_year').notNullable();
    table.string('grade');
    table.float('percentage');
    table.string('certificate_url');
    table.timestamps(true, true);
  });

  // 14. Staff Work Experience
  await knex.schema.createTable('staff_experiences', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('organization_name').notNullable();
    table.string('designation').notNullable();
    table.string('employment_type').defaultTo('FULL_TIME');
    table.string('start_date').notNullable();
    table.string('end_date');
    table.boolean('is_current').defaultTo(false);
    table.text('description');
    table.string('experience_certificate_url');
    table.timestamps(true, true);
  });

  // 15. Subjects & Staff Subject Allocations
  await knex.schema.createTable('subjects', (table) => {
    table.string('id').primary();
    table.string('institute_id').notNullable().references('id').inTable('institutes').onDelete('CASCADE');
    table.string('code').notNullable();
    table.string('name').notNullable();
    table.integer('credits').defaultTo(4);
    table.integer('semester').defaultTo(1);
    table.string('status').defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('staff_subjects', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.string('academic_year').notNullable().defaultTo('2026-2027');
    table.integer('semester').notNullable();
    table.string('section').defaultTo('A');
    table.timestamps(true, true);
  });

  // 16. Salary & Increments
  await knex.schema.createTable('staff_salary', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.float('basic_salary').notNullable();
    table.float('hra').defaultTo(0);
    table.float('special_allowance').defaultTo(0);
    table.float('gross_salary').notNullable();
    table.float('deductions').defaultTo(0);
    table.float('net_salary').notNullable();
    table.string('effective_from').notNullable();
    table.string('effective_to');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('staff_increments', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.float('previous_salary').notNullable();
    table.float('increment_amount').notNullable();
    table.float('new_salary').notNullable();
    table.string('increment_date').notNullable();
    table.string('reason');
    table.string('approved_by');
    table.timestamps(true, true);
  });

  // 17. Leave Management
  await knex.schema.createTable('leave_types', (table) => {
    table.string('id').primary();
    table.string('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name').notNullable(); // Casual Leave, Medical Leave, Earned Leave, Sabbatical
    table.string('code').notNullable();
    table.integer('default_days').defaultTo(12);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('staff_leave_balance', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('leave_type_id').notNullable().references('id').inTable('leave_types').onDelete('CASCADE');
    table.integer('year').notNullable().defaultTo(2026);
    table.integer('allocated').notNullable();
    table.integer('used').defaultTo(0);
    table.integer('remaining').notNullable();
    table.timestamps(true, true);
  });

  // 18. Staff Documents
  await knex.schema.createTable('staff_documents', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('document_type').notNullable(); // PROFILE_PHOTO, AADHAAR, PAN, DEGREE_CERTIFICATE, EXPERIENCE_CERTIFICATE, JOINING_LETTER, OTHER
    table.string('document_name').notNullable();
    table.string('file_key');
    table.string('file_url').notNullable();
    table.string('mime_type').defaultTo('application/pdf');
    table.integer('file_size').defaultTo(102400);
    table.string('uploaded_by');
    table.timestamps(true, true);
  });

  // 19. Staff Evaluation Remarks
  await knex.schema.createTable('staff_remarks', (table) => {
    table.string('id').primary();
    table.string('staff_id').notNullable().references('id').inTable('staff').onDelete('CASCADE');
    table.string('remark_type').notNullable(); // REPORTING_AUTHORITY, HOD, PRINCIPAL, CHANCELLOR, ADMIN
    table.text('remark').notNullable();
    table.string('rating'); // OUTSTANDING, VERY_GOOD, GOOD, SATISFACTORY, NEEDS_IMPROVEMENT
    table.string('created_by').notNullable();
    table.string('created_by_name').defaultTo('Administrator');
    table.timestamps(true, true);
  });

  // 20. Audit Logs
  await knex.schema.createTable('audit_logs', (table) => {
    table.string('id').primary();
    table.string('organization_id');
    table.string('user_id');
    table.string('action').notNullable(); // CREATE, UPDATE, DELETE, VIEW_SALARY, STATUS_CHANGE
    table.string('entity_type').notNullable(); // STAFF, DEPARTMENT, SALARY, DOCUMENT, REMARK
    table.string('entity_id').notNullable();
    table.text('old_values');
    table.text('new_values');
    table.string('ip_address').defaultTo('127.0.0.1');
    table.string('user_agent');
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('staff_remarks');
  await knex.schema.dropTableIfExists('staff_documents');
  await knex.schema.dropTableIfExists('staff_leave_balance');
  await knex.schema.dropTableIfExists('leave_types');
  await knex.schema.dropTableIfExists('staff_increments');
  await knex.schema.dropTableIfExists('staff_salary');
  await knex.schema.dropTableIfExists('staff_subjects');
  await knex.schema.dropTableIfExists('subjects');
  await knex.schema.dropTableIfExists('staff_experiences');
  await knex.schema.dropTableIfExists('staff_qualifications');
  await knex.schema.dropTableIfExists('staff_employment');
  await knex.schema.dropTableIfExists('staff_addresses');
  await knex.schema.dropTableIfExists('staff_profiles');
  await knex.schema.dropTableIfExists('staff');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('qualifications');
  await knex.schema.dropTableIfExists('designations');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('institutes');
  await knex.schema.dropTableIfExists('campuses');
  await knex.schema.dropTableIfExists('organizations');
};
