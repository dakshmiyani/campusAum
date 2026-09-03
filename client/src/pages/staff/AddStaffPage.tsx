import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Department, Designation, QualificationMaster } from '../../types';
import { ArrowLeft, CheckCircle, User } from 'lucide-react';

export const AddStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [qualifications, setQualifications] = useState<QualificationMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '1988-05-15',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',

    // Step 2: Contact & Address
    officialEmail: '',
    personalEmail: '',
    officialMobile: '',
    personalMobile: '',
    addressLine1: 'Flat 402, Green Acres Apartment',
    addressLine2: 'Palm Beach Road, Sector 15',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400703',

    // Step 3: Employment
    employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
    staffType: 'TEACHING',
    departmentId: '',
    designationId: '',
    joiningDate: '2026-06-01',
    employmentType: 'PERMANENT',
    workLocation: 'Engineering Block A, Room 204',
    basicSalary: '95000',

    // Step 4: Qualifications
    degreeName: 'M.Tech in Artificial Intelligence',
    institution: 'Indian Institute of Technology (IIT) Bombay',
    specialization: 'Computer Engineering & Machine Learning',
    passingYear: '2016',
    percentage: '86.5',

    // Step 5: Experience
    prevOrg: 'Infosys Research & Development Labs',
    prevDesignation: 'Senior Lead Systems Architect',
    expStartDate: '2016-07-01',
    expEndDate: '2026-05-15',
    expDescription: 'Led AI solution architecture and research projects.',

    // Step 6: Subjects
    allocatedSubject: 'CS-701 Artificial Intelligence & Machine Learning',

    // Step 7: Documents
    docType: 'DEGREE_CERTIFICATE',
    docName: 'MTech_Degree_Certificate.pdf',
  });

  useEffect(() => {
    async function loadFormMetadata() {
      try {
        const [dRes, desRes, qRes] = await Promise.all([
          api.get('/departments'),
          api.get('/designations'),
          api.get('/qualifications'),
        ]);
        setDepartments(dRes.data.data);
        setDesignations(desRes.data.data);
        setQualifications(qRes.data.data);

        if (dRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: dRes.data.data[0].id }));
        }
        if (desRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, designationId: desRes.data.data[0].id }));
        }
      } catch (err) {
        console.error('Error loading form metadata:', err);
      }
    }
    loadFormMetadata();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const findMissingRequiredField = () => {
    const requiredFields = [
      ['First Name', formData.firstName],
      ['Last Name', formData.lastName],
      ['Official Email', formData.officialEmail],
      ['Official Mobile', formData.officialMobile],
      ['Employee ID Code', formData.employeeCode],
      ['Department', formData.departmentId],
      ['Designation', formData.designationId],
      ['Highest Degree Name', formData.degreeName],
      ['University / Institution', formData.institution],
    ];
    return requiredFields.find(([, value]) => !value.trim())?.[0];
  };

  const openReview = () => {
    setReviewError('');
    setCurrentStep(8);
  };

  const handleSubmit = async () => {
    const missingField = findMissingRequiredField();
    if (missingField) {
      setReviewError(`Please return to Details and complete: ${missingField}.`);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/staff', formData);
      alert('Staff record created successfully!');
      navigate(`/staff/${res.data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating staff record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <Link to="/staff" className="text-xs font-semibold text-[#722B2B] hover:underline flex items-center space-x-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Staff Directory</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Add New Faculty / Staff Member</h1>
          <p className="text-xs text-[#6F6A60]">
            Multi-step SaaS onboarding workflow for teacher profiling
          </p>
        </div>
        <div className="text-xs font-bold text-[#17243A] bg-[#C9A85C]/20 border border-[#C9A85C] px-3 py-1.5 rounded-lg">
          {currentStep === 8 ? 'Review & Submit' : 'Staff Details'}
        </div>
      </div>

      {/* Details and review navigation */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#D8C28A] bg-[#EFE8DA] p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-bold transition-all ${currentStep !== 8 ? 'bg-[#17243A] text-[#C9A85C]' : 'text-[#6F6A60] hover:bg-[#F8F4EC]'}`}
        >
          <User className="h-4 w-4" />
          Details
        </button>
        <button
          type="button"
          onClick={openReview}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-bold transition-all ${currentStep === 8 ? 'bg-[#17243A] text-[#C9A85C]' : 'text-[#6F6A60] hover:bg-[#F8F4EC]'}`}
        >
          <CheckCircle className="h-4 w-4" />
          Review & Submit
        </button>
      </div>

      {/* Main Step Content Form Container */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 shadow-xs max-w-4xl mx-auto">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2">
              01 Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A] focus:border-[#C9A85C]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="e.g. Chandra"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Blood Group</label>
                <input
                  type="text"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  placeholder="e.g. O+"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Photo URL</label>
              <input
                type="text"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact & Address */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="border-t-2 border-[#C9A85C] pt-5 text-base font-serif font-bold text-[#17243A]">
              02 Contact & Address Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Official Email *</label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  placeholder="name@apexeducation.org"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Personal Email</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="name@gmail.com"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Official Mobile *</label>
                <input
                  type="text"
                  name="officialMobile"
                  value={formData.officialMobile}
                  onChange={handleChange}
                  placeholder="+91 98200 00000"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Personal Mobile</label>
                <input
                  type="text"
                  name="personalMobile"
                  value={formData.personalMobile}
                  onChange={handleChange}
                  placeholder="+91 98200 11111"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8C28A]">
              <h3 className="text-xs font-bold text-[#17243A] uppercase mb-2">Permanent Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Address Line 1"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
                <div className="space-y-3">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className="text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Employment */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="border-t-2 border-[#C9A85C] pt-5 text-base font-serif font-bold text-[#17243A]">
              03 Employment Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Employee ID Code *</label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] font-mono font-bold rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Staff Type *</label>
                <select
                  name="staffType"
                  value={formData.staffType}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                >
                  <option value="TEACHING">Teaching Faculty</option>
                  <option value="NON_TEACHING">Non-Teaching Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                >
                  <option value="PERMANENT">PERMANENT</option>
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="VISITING">VISITING</option>
                  <option value="TEMPORARY">TEMPORARY</option>
                  <option value="PROBATION">PROBATION</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Department *</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) {d.campus_name ? `— ${d.campus_name}` : ''} {d.institute_code ? `[${d.institute_code}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Designation *</label>
                <select
                  name="designationId"
                  value={formData.designationId}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                >
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Level {d.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Date of Joining</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Initial Basic Monthly Salary (₹)</label>
                <input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Qualifications */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="border-t-2 border-[#C9A85C] pt-5 text-base font-serif font-bold text-[#17243A]">
              04 Academic Qualifications
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Highest Degree Name *</label>
                <input
                  type="text"
                  name="degreeName"
                  value={formData.degreeName}
                  onChange={handleChange}
                  placeholder="e.g. Ph.D. / M.Tech / MBA"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">University / Institution *</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. IIT Bombay"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#17243A] mb-1">Passing Year</label>
                  <input
                    type="number"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17243A] mb-1">Percentage / CGPA</label>
                  <input
                    type="text"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                    placeholder="e.g. 86.5%"
                    className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Experience */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="border-t-2 border-[#C9A85C] pt-5 text-base font-serif font-bold text-[#17243A]">
              05 Prior Work Experience
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Previous Organization Name</label>
                <input
                  type="text"
                  name="prevOrg"
                  value={formData.prevOrg}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Previous Designation</label>
                <input
                  type="text"
                  name="prevDesignation"
                  value={formData.prevDesignation}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Description / Responsibilities</label>
                <textarea
                  name="expDescription"
                  value={formData.expDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Subjects */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="border-t-2 border-[#C9A85C] pt-5 text-base font-serif font-bold text-[#17243A]">
              06 Primary Teaching Subject Allocation
            </h2>
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Subject Name & Code</label>
              <input
                type="text"
                name="allocatedSubject"
                value={formData.allocatedSubject}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              />
            </div>
          </div>
        )}

        {/* Step 7: Documents */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="border-t-2 border-[#C9A85C] pt-5 text-base font-serif font-bold text-[#17243A]">
              07 Institutional Documents Registration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">Document Category</label>
                <select
                  name="docType"
                  value={formData.docType}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                >
                  <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="EXPERIENCE_CERTIFICATE">Experience Certificate</option>
                  <option value="JOINING_LETTER">Joining Letter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#17243A] mb-1">File Name</label>
                <input
                  type="text"
                  name="docName"
                  value={formData.docName}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h2 className="text-base font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2">
              08 Review & Institutional Confirmation
            </h2>

            <div className="bg-[#F8F4EC] border border-[#D8C28A] rounded-lg p-4 space-y-3 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-[#6F6A60]">Full Name:</span>{' '}
                  <span className="font-bold text-[#17243A]">
                    {formData.firstName} {formData.middleName} {formData.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-[#6F6A60]">Employee ID:</span>{' '}
                  <span className="font-mono font-bold text-[#17243A]">{formData.employeeCode}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60]">Staff Type:</span>{' '}
                  <span className="font-bold text-[#17243A]">{formData.staffType}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60]">Official Email:</span>{' '}
                  <span className="font-bold text-[#17243A]">{formData.officialEmail}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60]">Degree:</span>{' '}
                  <span className="font-bold text-[#17243A]">{formData.degreeName}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60]">Initial Basic Salary:</span>{' '}
                  <span className="font-bold text-[#17243A]">₹{formData.basicSalary}/month</span>
                </div>
              </div>
            </div>
            {reviewError && <p className="font-semibold text-[#722B2B]">{reviewError}</p>}
          </div>
        )}

        {/* Navigation Button Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-[#D8C28A] mt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-semibold text-[#17243A] bg-[#F8F4EC] border border-[#D8C28A] rounded-lg disabled:opacity-40"
          >
            ← Previous Step
          </button>

          {currentStep !== 8 ? (
            <button
              type="button"
              onClick={openReview}
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold bg-[#C9A85C] text-[#17243A] rounded-lg shadow-xs hover:bg-[#D9BE7A] transition-all"
            >
              <span>Review & Submit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold bg-[#722B2B] text-white rounded-lg shadow-md hover:bg-[#5A2222] transition-all"
            >
              <span>{loading ? 'Submitting...' : 'Confirm & Create Staff Record ✓'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
