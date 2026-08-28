import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { DetailedStaff } from '../../types';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Award,
  GraduationCap,
  Briefcase,
  BookOpen,
  DollarSign,
  FileText,
  MessageSquare,
  History,
  MapPin,
  Clock,
  Plus,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<DetailedStaff | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Modal State for adding Remarks / Increment
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [remarkType, setRemarkType] = useState('PRINCIPAL');

  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [incAmount, setIncAmount] = useState('15000');
  const [incReason, setIncReason] = useState('Annual Performance Promotion');

  useEffect(() => {
    async function fetchStaffDetail() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/staff/${id}`);
        setStaff(res.data.data);
      } catch (err) {
        console.error('Error fetching staff profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStaffDetail();
  }, [id]);

  const handleAddRemark = async () => {
    if (!id || !newRemark) return;
    try {
      await api.post(`/staff/${id}/remarks`, {
        remarkType,
        remark: newRemark,
        createdByName: 'Dr. S. K. Mehta (Principal)',
      });
      alert('Remark recorded successfully!');
      setShowRemarkModal(false);
      setNewRemark('');
      // Reload detail
      const res = await api.get(`/staff/${id}`);
      setStaff(res.data.data);
    } catch (err) {
      alert('Error recording remark.');
    }
  };

  const handleAddIncrement = async () => {
    if (!id || !staff?.salary) return;
    const prev = staff.salary.gross_salary;
    const inc = parseFloat(incAmount);
    const newSal = prev + inc;

    try {
      await api.post(`/staff/${id}/increments`, {
        previousSalary: prev,
        incrementAmount: inc,
        newSalary: newSal,
        reason: incReason,
        approvedBy: 'Principal & Governing Board',
      });
      alert('Increment applied successfully!');
      setShowIncrementModal(false);
      // Reload detail
      const res = await api.get(`/staff/${id}`);
      setStaff(res.data.data);
    } catch (err) {
      alert('Error applying increment.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#6F6A60]">Loading teacher profile...</div>;
  }

  if (!staff) {
    return <div className="p-12 text-center text-xs text-[#722B2B]">Staff profile record not found.</div>;
  }

  const { profile, employment, addresses, qualifications, experiences, subjects, salary, increments, leaveBalances, documents, remarks } = staff;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-3">
        <Link to="/staff" className="text-xs font-semibold text-[#722B2B] hover:underline flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Staff Roster</span>
        </Link>
        <div className="flex items-center space-x-2">
          <Badge variant={staff.status === 'ACTIVE' ? 'active' : 'inactive'}>
            ● {staff.status}
          </Badge>
          <Badge variant={staff.staff_type === 'TEACHING' ? 'teaching' : 'non-teaching'}>
            {staff.staff_type === 'TEACHING' ? 'Teaching Faculty' : 'Non-Teaching'}
          </Badge>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={
              profile?.photo_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
            }
            alt={profile?.first_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#C9A85C] shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-serif font-bold text-[#17243A]">
                {profile?.first_name} {profile?.middle_name ? `${profile?.middle_name} ` : ''}
                {profile?.last_name}
              </h1>
              <span className="font-mono text-xs font-bold bg-[#17243A] text-[#C9A85C] px-2.5 py-1 rounded-md">
                {staff.employee_code}
              </span>
            </div>
            <div className="text-xs font-semibold text-[#17243A] flex items-center space-x-2">
              <Award className="w-3.5 h-3.5 text-[#C9A85C]" />
              <span>{staff.designation_name}</span>
              <span>•</span>
              <Building className="w-3.5 h-3.5 text-[#C9A85C]" />
              <span>{staff.department_name}</span>
            </div>
            <div className="text-[11px] text-[#6F6A60] flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-3 h-3 text-[#C9A85C]" />
                <span>{profile?.official_email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#C9A85C]" />
                <span>{profile?.official_mobile}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#C9A85C]" />
                <span>Joined {employment?.joining_date || '2015-06-15'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 self-end md:self-center">
          <button
            onClick={() => setShowRemarkModal(true)}
            className="px-3.5 py-2 bg-[#17243A] text-white rounded-lg text-xs font-semibold hover:bg-[#243552] transition-colors"
          >
            + Add Remark
          </button>
          <button
            onClick={() => setShowIncrementModal(true)}
            className="px-3.5 py-2 bg-[#C9A85C] text-[#17243A] rounded-lg text-xs font-bold shadow-xs hover:bg-[#D9BE7A] transition-colors"
          >
            + Salary Increment
          </button>
        </div>
      </div>

      {/* 10 Interactive Profile Tabs Header */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl overflow-x-auto shadow-xs">
        <div className="flex border-b border-[#D8C28A] min-w-[800px] text-xs font-semibold text-[#6F6A60]">
          {[
            { id: 'overview', name: 'Overview', icon: User },
            { id: 'employment', name: 'Employment', icon: Briefcase },
            { id: 'addresses', name: 'Addresses', icon: MapPin },
            { id: 'education', name: 'Education', icon: GraduationCap },
            { id: 'experience', name: 'Experience', icon: Clock },
            { id: 'subjects', name: 'Subjects', icon: BookOpen },
            { id: 'salary', name: 'Salary & Increments', icon: DollarSign },
            { id: 'leave', name: 'Leave Balances', icon: Calendar },
            { id: 'documents', name: 'Documents', icon: FileText },
            { id: 'remarks', name: 'Remarks & Audit', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#722B2B] text-[#722B2B] font-bold bg-[#F8F4EC]'
                    : 'border-transparent hover:text-[#17243A] hover:bg-[#F8F4EC]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-6 bg-[#F8F4EC] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info Box */}
              <div className="custom-card p-5 space-y-3">
                <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2 flex items-center justify-between">
                  <span>Personal Information</span>
                  <User className="w-4 h-4 text-[#C9A85C]" />
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6F6A60] block">Full Name</span>
                    <span className="font-bold text-[#17243A]">
                      {profile?.first_name} {profile?.middle_name} {profile?.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6F6A60] block">Date of Birth</span>
                    <span className="font-semibold text-[#17243A]">{profile?.date_of_birth}</span>
                  </div>
                  <div>
                    <span className="text-[#6F6A60] block">Gender</span>
                    <span className="font-semibold text-[#17243A]">{profile?.gender}</span>
                  </div>
                  <div>
                    <span className="text-[#6F6A60] block">Blood Group</span>
                    <span className="font-semibold text-[#17243A]">{profile?.blood_group || 'O+'}</span>
                  </div>
                </div>
              </div>

              {/* Employment Summary Box */}
              <div className="custom-card p-5 space-y-3">
                <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2 flex items-center justify-between">
                  <span>Employment Summary</span>
                  <Briefcase className="w-4 h-4 text-[#C9A85C]" />
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#6F6A60] block">Employee ID</span>
                    <span className="font-mono font-bold text-[#17243A]">{staff.employee_code}</span>
                  </div>
                  <div>
                    <span className="text-[#6F6A60] block">Department</span>
                    <span className="font-semibold text-[#17243A]">{staff.department_name}</span>
                  </div>
                  <div>
                    <span className="text-[#6F6A60] block">Designation</span>
                    <span className="font-semibold text-[#17243A]">{staff.designation_name}</span>
                  </div>
                  <div>
                    <span className="text-[#6F6A60] block">Employment Type</span>
                    <span className="font-semibold text-[#17243A]">{employment?.employment_type || 'PERMANENT'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment Details */}
        {activeTab === 'employment' && (
          <div className="p-6 bg-[#F8F4EC] space-y-4">
            <div className="custom-card p-5 space-y-4 text-xs">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2">
                Detailed Employment Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[#6F6A60] block">Date of Joining</span>
                  <span className="font-bold text-[#17243A]">{employment?.joining_date}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Confirmation Date</span>
                  <span className="font-semibold text-[#17243A]">{employment?.confirmation_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Retirement Date</span>
                  <span className="font-semibold text-[#17243A]">{employment?.retirement_date || '2042-04-30'}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Work Location</span>
                  <span className="font-semibold text-[#17243A]">{employment?.work_location || 'Main Block'}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Campus Scope</span>
                  <span className="font-semibold text-[#17243A]">{staff.campus?.name}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Institute</span>
                  <span className="font-semibold text-[#17243A]">{staff.institute?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Addresses */}
        {activeTab === 'addresses' && (
          <div className="p-6 bg-[#F8F4EC] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {addresses?.map((addr) => (
              <div key={addr.id} className="custom-card p-5 space-y-2">
                <div className="font-bold text-[#722B2B] uppercase tracking-wider text-[11px] border-b border-[#D8C28A] pb-1">
                  {addr.address_type} ADDRESS
                </div>
                <div className="font-semibold text-[#17243A]">{addr.address_line_1}</div>
                {addr.address_line_2 && <div>{addr.address_line_2}</div>}
                <div>
                  {addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span>
                </div>
                <div className="text-[#6F6A60]">{addr.country}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Academic Qualifications */}
        {activeTab === 'education' && (
          <div className="p-6 bg-[#F8F4EC] space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Academic Degrees & Certificates</h3>
            <div className="space-y-3">
              {qualifications?.map((q) => (
                <div key={q.id} className="custom-card p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-[#17243A] text-[#C9A85C] flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#17243A]">{q.degree_name}</div>
                      <div className="text-[#6F6A60]">{q.institution} • Specialization: {q.specialization}</div>
                      <div className="text-[11px] font-semibold text-[#722B2B] mt-0.5">
                        Year: {q.passing_year} | Grade: {q.grade} ({q.percentage}%)
                      </div>
                    </div>
                  </div>
                  {q.certificate_url && (
                    <a
                      href={q.certificate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#EFE8DA] border border-[#D8C28A] rounded-md text-[11px] font-semibold text-[#17243A] hover:bg-[#C9A85C]"
                    >
                      View Certificate PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Work Experience */}
        {activeTab === 'experience' && (
          <div className="p-6 bg-[#F8F4EC] space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Professional Work Experience Timeline</h3>
            <div className="space-y-3">
              {experiences?.map((exp) => (
                <div key={exp.id} className="custom-card p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#17243A]">{exp.designation}</span>
                    <span className="font-mono text-[11px] bg-[#17243A] text-[#C9A85C] px-2 py-0.5 rounded-md">
                      {exp.start_date} to {exp.end_date || 'Present'}
                    </span>
                  </div>
                  <div className="font-semibold text-[#6F6A60]">{exp.organization_name}</div>
                  <p className="text-[#17243A]">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Subjects */}
        {activeTab === 'subjects' && (
          <div className="p-6 bg-[#F8F4EC] space-y-4 text-xs">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Allocated Academic Subjects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects?.map((sub) => (
                <div key={sub.id} className="custom-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#722B2B]">{sub.subject_code}</span>
                    <Badge variant="navy">Sem {sub.semester}</Badge>
                  </div>
                  <div className="font-bold text-sm text-[#17243A]">{sub.subject_name}</div>
                  <div className="text-[#6F6A60]">
                    Credits: {sub.credits} | Academic Year: {sub.academic_year} | Section {sub.section}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Salary & Increments */}
        {activeTab === 'salary' && (
          <div className="p-6 bg-[#F8F4EC] space-y-6 text-xs">
            {/* Salary Breakdown Card */}
            <div className="custom-card p-5 space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2 flex items-center justify-between">
                <span>Monthly Compensation Structure</span>
                <DollarSign className="w-4 h-4 text-[#C9A85C]" />
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[#F8F4EC] rounded-lg border border-[#D8C28A]">
                  <span className="text-[#6F6A60] block text-[11px]">Basic Salary</span>
                  <span className="text-base font-bold text-[#17243A]">₹{salary?.basic_salary?.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F8F4EC] rounded-lg border border-[#D8C28A]">
                  <span className="text-[#6F6A60] block text-[11px]">HRA Allowance</span>
                  <span className="text-base font-bold text-[#17243A]">₹{salary?.hra?.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F8F4EC] rounded-lg border border-[#D8C28A]">
                  <span className="text-[#6F6A60] block text-[11px]">Gross Monthly</span>
                  <span className="text-base font-bold text-emerald-800">₹{salary?.gross_salary?.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F8F4EC] rounded-lg border border-[#D8C28A]">
                  <span className="text-[#6F6A60] block text-[11px]">Net Payable</span>
                  <span className="text-base font-bold text-[#722B2B]">₹{salary?.net_salary?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Increment History Audit Trail */}
            <div className="custom-card p-5 space-y-3">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2">
                Historical Increment Audit Trail
              </h3>
              <div className="space-y-3">
                {increments?.map((inc) => (
                  <div key={inc.id} className="p-3 bg-[#F8F4EC] border border-[#D8C28A] rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#17243A]">
                        Increment: +₹{inc.increment_amount?.toLocaleString()} (New Salary: ₹{inc.new_salary?.toLocaleString()})
                      </div>
                      <div className="text-[#6F6A60] mt-0.5">
                        Reason: {inc.reason} | Approved by: {inc.approved_by}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#722B2B] font-semibold">{inc.increment_date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Leave Balances */}
        {activeTab === 'leave' && (
          <div className="p-6 bg-[#F8F4EC] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {leaveBalances?.map((lb) => (
              <div key={lb.id} className="custom-card p-4 space-y-3">
                <div className="font-bold text-sm text-[#17243A] flex justify-between">
                  <span>{lb.leave_name}</span>
                  <Badge variant="navy">{lb.leave_code}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[#6F6A60]">
                    <span>Used / Allocated</span>
                    <span className="font-bold text-[#17243A]">
                      {lb.used} / {lb.allocated} days
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#EFE8DA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A85C]"
                      style={{ width: `${(lb.used / lb.allocated) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right font-bold text-emerald-800">
                  {lb.remaining} days remaining
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 9: Documents */}
        {activeTab === 'documents' && (
          <div className="p-6 bg-[#F8F4EC] space-y-4 text-xs">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Registered Institutional Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents?.map((doc) => (
                <div key={doc.id} className="custom-card p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-[#C9A85C]" />
                    <div>
                      <div className="font-bold text-[#17243A]">{doc.document_name}</div>
                      <div className="text-[10px] text-[#6F6A60]">{doc.document_type}</div>
                    </div>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-[#17243A] text-white text-[11px] rounded-md hover:bg-[#243552]"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 10: Remarks & Evaluation */}
        {activeTab === 'remarks' && (
          <div className="p-6 bg-[#F8F4EC] space-y-4 text-xs">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Official Performance Evaluations & Remarks</h3>
            <div className="space-y-3">
              {remarks?.map((rem) => (
                <div key={rem.id} className="custom-card p-4 space-y-2 border-l-4 border-l-[#722B2B]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#722B2B]">{rem.remark_type} EVALUATION</span>
                    <Badge variant="active">{rem.rating || 'OUTSTANDING'}</Badge>
                  </div>
                  <p className="text-[#17243A] text-xs italic">"{rem.remark}"</p>
                  <div className="text-[10px] text-[#6F6A60] text-right">
                    — Recorded by {rem.created_by_name || 'Administrator'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#17243A]">Record Performance Remark</h3>
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Authority Type</label>
              <select
                value={remarkType}
                onChange={(e) => setRemarkType(e.target.value)}
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              >
                <option value="REPORTING_AUTHORITY">Reporting Authority</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="PRINCIPAL">Principal / Director</option>
                <option value="CHANCELLOR">Chancellor / Trustee</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Evaluation Remark *</label>
              <textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                rows={4}
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                placeholder="Enter evaluation notes..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRemarkModal(false)}
                className="px-4 py-1.5 text-xs text-[#17243A] bg-[#F8F4EC] border border-[#D8C28A] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRemark}
                className="px-4 py-1.5 text-xs font-bold bg-[#17243A] text-white rounded-md hover:bg-[#243552]"
              >
                Save Remark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Increment Modal */}
      {showIncrementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#17243A]">Apply Salary Increment</h3>
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Increment Amount (₹)</label>
              <input
                type="number"
                value={incAmount}
                onChange={(e) => setIncAmount(e.target.value)}
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Reason / Justification</label>
              <input
                type="text"
                value={incReason}
                onChange={(e) => setIncReason(e.target.value)}
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowIncrementModal(false)}
                className="px-4 py-1.5 text-xs text-[#17243A] bg-[#F8F4EC] border border-[#D8C28A] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIncrement}
                className="px-4 py-1.5 text-xs font-bold bg-[#C9A85C] text-[#17243A] rounded-md hover:bg-[#D9BE7A]"
              >
                Confirm Increment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
