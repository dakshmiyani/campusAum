export interface Organization {
  id: string;
  name: string;
  code: string;
  slug: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Campus {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Institute {
  id: string;
  campus_id: string;
  name: string;
  code: string;
  type: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  institute_id: string;
  name: string;
  code: string;
  description?: string;
  hod_staff_id?: string;
  hod_first_name?: string;
  hod_last_name?: string;
  hod_email?: string;
  staff_count?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Designation {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  level: number;
  description?: string;
  staff_count?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface QualificationMaster {
  id: string;
  name: string;
  level: string;
  specialization?: string;
}

export interface StaffProfile {
  id: string;
  staff_id: string;
  photo_url?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  blood_group?: string;
  official_email: string;
  personal_email?: string;
  official_mobile: string;
  personal_mobile?: string;
}

export interface StaffAddress {
  id: string;
  staff_id: string;
  address_type: 'PERMANENT' | 'CORRESPONDENCE';
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface StaffEmployment {
  id: string;
  staff_id: string;
  joining_date: string;
  confirmation_date?: string;
  employment_type: 'PERMANENT' | 'CONTRACT' | 'VISITING' | 'TEMPORARY' | 'PROBATION';
  employee_status: string;
  retirement_date?: string;
  work_location?: string;
}

export interface StaffQualification {
  id: string;
  staff_id: string;
  qualification_id?: string;
  degree_name: string;
  institution: string;
  specialization?: string;
  passing_year: number;
  grade?: string;
  percentage?: number;
  certificate_url?: string;
}

export interface StaffExperience {
  id: string;
  staff_id: string;
  organization_name: string;
  designation: string;
  employment_type?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  experience_certificate_url?: string;
}

export interface Subject {
  id: string;
  institute_id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  status: string;
  allocations?: any[];
}

export interface StaffSubject {
  id: string;
  staff_id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  credits?: number;
  academic_year: string;
  semester: number;
  section?: string;
}

export interface StaffSalary {
  id: string;
  staff_id: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  effective_from: string;
  effective_to?: string;
}

export interface StaffIncrement {
  id: string;
  staff_id: string;
  previous_salary: number;
  increment_amount: number;
  new_salary: number;
  increment_date: string;
  reason?: string;
  approved_by?: string;
}

export interface StaffLeaveBalance {
  id: string;
  staff_id: string;
  leave_type_id: string;
  leave_name?: string;
  leave_code?: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
}

export interface StaffDocument {
  id: string;
  staff_id: string;
  document_type: 'PROFILE_PHOTO' | 'AADHAAR' | 'PAN' | 'DEGREE_CERTIFICATE' | 'EXPERIENCE_CERTIFICATE' | 'JOINING_LETTER' | 'OTHER';
  document_name: string;
  file_key?: string;
  file_url: string;
  mime_type?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at?: string;
}

export interface StaffRemark {
  id: string;
  staff_id: string;
  remark_type: 'REPORTING_AUTHORITY' | 'HOD' | 'PRINCIPAL' | 'CHANCELLOR' | 'ADMIN';
  remark: string;
  rating?: string;
  created_by: string;
  created_by_name?: string;
  created_at?: string;
}

export interface StaffListItem {
  id: string;
  employee_code: string;
  staff_type: 'TEACHING' | 'NON_TEACHING';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  first_name: string;
  middle_name?: string;
  last_name: string;
  official_email: string;
  official_mobile: string;
  photo_url?: string;
  department_name: string;
  department_code: string;
  designation_name: string;
  designation_code: string;
}

export interface DetailedStaff extends StaffListItem {
  profile?: StaffProfile;
  addresses?: StaffAddress[];
  employment?: StaffEmployment;
  qualifications?: StaffQualification[];
  experiences?: StaffExperience[];
  subjects?: StaffSubject[];
  salary?: StaffSalary;
  increments?: StaffIncrement[];
  leaveBalances?: StaffLeaveBalance[];
  documents?: StaffDocument[];
  remarks?: StaffRemark[];
  department?: Department;
  designation?: Designation;
  campus?: Campus;
  institute?: Institute;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  created_at: string;
}
