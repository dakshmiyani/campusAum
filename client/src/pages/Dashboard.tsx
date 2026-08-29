import React, { useEffect, useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import api from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Users, UserCheck, UserX, Building, Plus, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaffListItem } from '../types';

export const Dashboard: React.FC = () => {
  const { activeInstitute, activeCampus } = useTenant();
  const [summary, setSummary] = useState<any>(null);
  const [recentStaff, setRecentStaff] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        let summaryUrl = '/reports/summary?';
        let staffUrl = '/staff?limit=5&';

        if (activeCampus) {
          summaryUrl += `campusId=${activeCampus.id}&`;
          staffUrl += `campusId=${activeCampus.id}&`;
        }
        if (activeInstitute) {
          summaryUrl += `instituteId=${activeInstitute.id}&`;
          staffUrl += `instituteId=${activeInstitute.id}&`;
        }

        const [sumRes, staffRes] = await Promise.all([
          api.get(summaryUrl),
          api.get(staffUrl),
        ]);
        setSummary(sumRes.data.data);
        setRecentStaff(staffRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [activeInstitute, activeCampus]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 relative overflow-hidden shadow-xs">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#722B2B]">
              Campus Scope: {activeCampus?.name || 'Main Campus'}
            </span>
            <span className="text-[#6F6A60]">•</span>
            <span className="text-xs text-[#6F6A60]">{activeInstitute?.name || 'All Institutes'}</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">
            Good Morning, Dr. Rahul Sharma
          </h1>
          <p className="text-xs text-[#6F6A60] leading-relaxed">
            Welcome to the CampusAUM Teacher Profiling & Staff Management Hub. Here is your institutional faculty breakdown, department allocation, and recent additions.
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <Link
            to="/staff/new"
            className="inline-flex items-center space-x-2 bg-[#C9A85C] text-[#17243A] px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#D9BE7A] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Faculty / Staff</span>
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center space-x-2 bg-[#17243A] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#243552] transition-all"
          >
            <FileText className="w-4 h-4 text-[#C9A85C]" />
            <span>View Full Analytical Reports</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff Members"
          value={summary?.totalStaff || 248}
          subtitle="Across all departments"
          icon={Users}
          color="navy"
          trend="+12 this semester"
        />
        <StatCard
          title="Teaching Faculty"
          value={summary?.teachingCount || 186}
          subtitle="Professors, Assoc & Asst"
          icon={UserCheck}
          color="gold"
          trend="75% of total workforce"
        />
        <StatCard
          title="Non-Teaching Staff"
          value={summary?.nonTeachingCount || 62}
          subtitle="Admin, Finance & Labs"
          icon={UserX}
          color="gold"
          trend="25% of total workforce"
        />
        <StatCard
          title="Active Departments"
          value={summary?.departmentBreakdown?.length || 6}
          subtitle="Engineering, Admin & MBA"
          icon={Building}
          color="burgundy"
        />
      </div>

      {/* Grid: Department Distribution & Recent Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-2 bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4 mb-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[#17243A]">Staff Distribution by Department</h2>
              <p className="text-xs text-[#6F6A60]">Real-time headcount per academic wing</p>
            </div>
            <Link to="/departments" className="text-xs font-semibold text-[#722B2B] hover:underline flex items-center space-x-1">
              <span>View Departments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {summary?.departmentBreakdown?.map((dept: any, idx: number) => {
              const percentage = Math.round((dept.staff_count / (summary?.totalStaff || 1)) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-[#17243A]">
                    <span>{dept.department_name}</span>
                    <span className="font-bold">{dept.staff_count} Staff ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F8F4EC] rounded-full overflow-hidden border border-[#D8C28A]/50">
                    <div
                      className="h-full bg-[#C9A85C] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Additions Card */}
        <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-3 mb-4">
              <h2 className="text-base font-serif font-bold text-[#17243A]">Recent Additions</h2>
              <span className="text-[10px] font-semibold bg-[#C9A85C]/20 text-[#17243A] px-2 py-0.5 rounded-full">
                Latest Profiles
              </span>
            </div>

            <div className="space-y-3">
              {recentStaff.map((staff) => (
                <Link
                  key={staff.id}
                  to={`/staff/${staff.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F4EC] border border-[#D8C28A]/60 hover:border-[#C9A85C] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={staff.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={staff.first_name}
                      className="w-9 h-9 rounded-full object-cover border border-[#C9A85C]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#17243A]">
                        {staff.first_name} {staff.last_name}
                      </div>
                      <div className="text-[10px] text-[#6F6A60]">
                        {staff.designation_name} • {staff.department_code}
                      </div>
                    </div>
                  </div>
                  <Badge variant={staff.staff_type === 'TEACHING' ? 'teaching' : 'non-teaching'}>
                    {staff.staff_type === 'TEACHING' ? 'Faculty' : 'Staff'}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/staff"
            className="mt-4 text-center block w-full bg-[#17243A] text-[#C9A85C] py-2 rounded-lg text-xs font-semibold hover:bg-[#243552] transition-colors"
          >
            View All Staff Directory →
          </Link>
        </div>
      </div>
    </div>
  );
};
