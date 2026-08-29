import React from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { Building2, Landmark, GraduationCap, Bell, ShieldCheck, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { organizations, campuses, institutes, activeOrg, activeCampus, activeInstitute, setActiveOrg, setActiveCampus, setActiveInstitute } = useTenant();

  return (
    <header className="h-16 bg-[#EFE8DA] border-b border-[#D8C28A] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Multi-Tenant Scope Switcher */}
      <div className="flex items-center space-x-2 md:space-x-3 text-xs overflow-x-auto py-1">
        {/* Organization Switcher */}
        <div className="flex items-center space-x-1.5 bg-[#F8F4EC] px-2.5 md:px-3 py-1.5 rounded-lg border border-[#D8C28A] text-[#17243A] font-medium shrink-0">
          <Building2 className="w-3.5 h-3.5 text-[#C9A85C] shrink-0" />
          <select
            value={activeOrg?.id || ''}
            onChange={(e) => {
              const selected = organizations.find((o) => o.id === e.target.value);
              if (selected) setActiveOrg(selected);
            }}
            className="bg-transparent text-xs text-[#17243A] font-semibold focus:outline-hidden cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[#6F6A60] font-bold shrink-0">/</span>

        {/* Campus Switcher */}
        <div className="flex items-center space-x-1.5 bg-[#F8F4EC] px-2.5 md:px-3 py-1.5 rounded-lg border border-[#D8C28A] text-[#17243A] font-medium shrink-0">
          <Landmark className="w-3.5 h-3.5 text-[#C9A85C] shrink-0" />
          <select
            value={activeCampus?.id || ''}
            onChange={(e) => {
              const selected = campuses.find((c) => c.id === e.target.value);
              if (selected) setActiveCampus(selected);
            }}
            className="bg-transparent text-xs text-[#17243A] font-semibold focus:outline-hidden cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[#6F6A60] font-bold shrink-0">/</span>

        {/* Institute Switcher */}
        <div className="flex items-center space-x-1.5 bg-[#F8F4EC] px-2.5 md:px-3 py-1.5 rounded-lg border border-[#D8C28A] text-[#17243A] font-medium shrink-0">
          <GraduationCap className="w-3.5 h-3.5 text-[#C9A85C] shrink-0" />
          <select
            value={activeInstitute?.id || ''}
            onChange={(e) => {
              const selected = institutes.find((i) => i.id === e.target.value);
              if (selected) setActiveInstitute(selected);
            }}
            className="bg-transparent text-xs text-[#17243A] font-semibold focus:outline-hidden cursor-pointer max-w-[160px] sm:max-w-[260px] truncate"
          >
            {institutes.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.code} — {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right controls: Role Badge, Notifications & Profile */}
      <div className="flex items-center space-x-3 md:space-x-4 shrink-0 pl-2">
        {/* Security / Role Badge */}
        <div className="hidden sm:flex items-center space-x-1 text-[11px] font-bold bg-[#C9A85C]/20 text-[#17243A] px-2.5 py-1 rounded-full border border-[#C9A85C]/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A85C]" />
          <span>SUPER ADMIN</span>
        </div>

        {/* Notifications Button */}
        <button className="p-2 text-[#6F6A60] hover:text-[#17243A] rounded-lg hover:bg-[#F8F4EC] relative transition-colors cursor-pointer border border-transparent hover:border-[#D8C28A]">
          <Bell className="w-4 h-4 text-[#17243A]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#722B2B] rounded-full ring-2 ring-[#EFE8DA]"></span>
        </button>

        {/* User Profile dropdown */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#D8C28A]">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-[#C9A85C] object-cover"
          />
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-[#17243A]">Dr. Rahul Sharma</div>
            <div className="text-[10px] font-medium text-[#6F6A60]">Administrator</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#6F6A60]" />
        </div>
      </div>
    </header>
  );
};

