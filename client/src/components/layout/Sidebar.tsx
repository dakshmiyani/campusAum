import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCheck2,
  UserPlus,
  Building,
  Award,
  GraduationCap,
  BookOpenCheck,
  FileText,
  BarChart3,
  Settings,
  Shield,
  User,
  ChevronRight,
  ChevronDown,
  Building2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [staffOpen, setStaffOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="w-64 bg-[#EFE8DA] border-r border-[#D8C28A] flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-[#D8C28A] px-6 flex items-center space-x-3 bg-[#EFE8DA]">
        <div className="w-9 h-9 rounded-lg bg-[#17243A] flex items-center justify-center text-[#C9A85C] shadow-md border border-[#C9A85C]/30">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="font-serif font-bold text-lg text-[#17243A] tracking-wide leading-tight">
            Campus<span className="text-[#C9A85C]">AUM</span>
          </div>
          <div className="text-[10px] uppercase font-semibold text-[#6F6A60] tracking-widest">
            Institutional SaaS
          </div>
        </div>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 text-xs font-medium">
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC] hover:text-[#17243A]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </NavLink>

        {/* Staff Group with Submenu */}
        <div>
          <button
            onClick={() => setStaffOpen(!staffOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-[#17243A] hover:bg-[#F8F4EC] ${
              location.pathname.startsWith('/staff') ? 'font-semibold text-[#17243A]' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-[#C9A85C]" />
              <span>Staff Management</span>
            </div>
            {staffOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#6F6A60]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#6F6A60]" />
            )}
          </button>

          {staffOpen && (
            <div className="ml-4 pl-3 border-l border-[#D8C28A] mt-1 space-y-1">
              <NavLink
                to="/staff"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-[#C9A85C]/20 text-[#17243A] font-bold border-l-2 border-[#C9A85C]' : 'text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]'
                  }`
                }
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Staff</span>
              </NavLink>

              <NavLink
                to="/staff?type=TEACHING"
                className={() => {
                  const isTeaching = location.pathname === '/staff' && location.search.includes('TEACHING');
                  return `flex items-center space-x-2.5 px-3 py-2 rounded-md transition-colors ${
                    isTeaching ? 'bg-[#C9A85C]/20 text-[#17243A] font-bold border-l-2 border-[#C9A85C]' : 'text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]'
                  }`;
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Teaching Staff</span>
              </NavLink>

              <NavLink
                to="/staff?type=NON_TEACHING"
                className={() => {
                  const isNonTeaching = location.pathname === '/staff' && location.search.includes('NON_TEACHING');
                  return `flex items-center space-x-2.5 px-3 py-2 rounded-md transition-colors ${
                    isNonTeaching ? 'bg-[#C9A85C]/20 text-[#17243A] font-bold border-l-2 border-[#C9A85C]' : 'text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]'
                  }`;
                }}
              >
                <UserCheck2 className="w-3.5 h-3.5" />
                <span>Non-Teaching Staff</span>
              </NavLink>

              <NavLink
                to="/staff/new"
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-[#C9A85C] text-[#17243A] font-bold' : 'text-[#722B2B] hover:bg-[#722B2B]/10 font-semibold'
                  }`
                }
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Staff</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Departments */}
        <NavLink
          to="/departments"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC]'
            }`
          }
        >
          <Building className="w-4 h-4 shrink-0" />
          <span>Departments</span>
        </NavLink>

        {/* Designations */}
        <NavLink
          to="/designations"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC]'
            }`
          }
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>Designations</span>
        </NavLink>

        {/* Qualifications */}
        <NavLink
          to="/qualifications"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC]'
            }`
          }
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>Qualifications</span>
        </NavLink>

        {/* Subject Allocation */}
        <NavLink
          to="/subjects"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC]'
            }`
          }
        >
          <BookOpenCheck className="w-4 h-4 shrink-0" />
          <span>Subject Allocation</span>
        </NavLink>

        {/* Documents */}
        <NavLink
          to="/documents"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC]'
            }`
          }
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Documents Center</span>
        </NavLink>

        {/* Reports */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-[#17243A] text-[#C9A85C] font-semibold shadow-xs'
                : 'text-[#17243A] hover:bg-[#F8F4EC]'
            }`
          }
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Reports & Analytics</span>
        </NavLink>

        {/* Settings Group */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-[#17243A] hover:bg-[#F8F4EC] ${
              location.pathname.startsWith('/settings') ? 'font-semibold' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-4 h-4 text-[#6F6A60]" />
              <span>Settings</span>
            </div>
            {settingsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#6F6A60]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#6F6A60]" />
            )}
          </button>

          {settingsOpen && (
            <div className="ml-4 pl-3 border-l border-[#D8C28A] mt-1 space-y-1">
              <NavLink
                to="/settings?tab=institution"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Institution</span>
              </NavLink>

              <NavLink
                to="/settings?tab=users"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/settings?tab=roles"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Roles & Permissions</span>
              </NavLink>

              <NavLink
                to="/settings?tab=profile"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Footer / System Version */}
      <div className="p-4 border-t border-[#D8C28A] bg-[#EFE8DA] text-[11px] text-[#6F6A60]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#17243A]">CampusAUM v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="text-[10px] mt-0.5">SaaS Staff Profiling Module</div>
      </div>
    </aside>
  );
};
