import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useTenant } from '../../contexts/TenantContext';
import { Building, Users, Shield, User, Key, Lock, Check } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'institution';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { activeOrg, activeCampus, activeInstitute } = useTenant();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'institution');
  }, [searchParams]);

  useEffect(() => {
    async function loadSettingsData() {
      setLoading(true);
      try {
        const [uRes, rRes, aRes] = await Promise.all([
          api.get('/settings/users'),
          api.get('/settings/roles'),
          api.get('/settings/audit-logs'),
        ]);
        setUsers(uRes.data.data);
        setRoles(rRes.data.data.roles);
        setPermissions(rRes.data.data.permissions);
        setAuditLogs(aRes.data.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettingsData();
  }, [activeOrg]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D8C28A] pb-4">
        <h1 className="text-2xl font-serif font-bold text-[#17243A]">System Settings & Administration</h1>
        <p className="text-xs text-[#6F6A60]">
          Institutional scope configuration, user management, RBAC permission matrix & system security
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#D8C28A] text-xs font-semibold text-[#6F6A60] bg-[#EFE8DA] rounded-t-xl overflow-hidden border">
        {[
          { id: 'institution', name: 'Institution Scope', icon: Building },
          { id: 'users', name: 'System Users', icon: Users },
          { id: 'roles', name: 'Roles & Permissions (RBAC)', icon: Shield },
          { id: 'profile', name: 'Admin Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#722B2B] text-[#722B2B] font-bold bg-[#F8F4EC]'
                  : 'border-transparent hover:text-[#17243A] hover:bg-[#F8F4EC]/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          )}
        )}
      </div>

      {/* Content Container */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-b-xl p-6 shadow-xs">
        {/* Tab 1: Institution Details */}
        {activeTab === 'institution' && (
          <div className="space-y-6 text-xs">
            <div className="custom-card p-5 space-y-3">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2">
                Active Organization / Trust Scope
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#6F6A60] block">Organization Name</span>
                  <span className="font-bold text-[#17243A]">{activeOrg?.name}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Trust Code</span>
                  <span className="font-mono font-bold text-[#722B2B]">{activeOrg?.code}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Primary Email</span>
                  <span className="font-semibold text-[#17243A]">{activeOrg?.email}</span>
                </div>
                <div>
                  <span className="text-[#6F6A60] block">Registered Address</span>
                  <span className="font-semibold text-[#17243A]">{activeOrg?.address}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="custom-card p-5 space-y-2">
                <h4 className="font-serif font-bold text-[#17243A] text-sm">Active Campus</h4>
                <div className="font-bold text-[#722B2B]">{activeCampus?.name} ({activeCampus?.code})</div>
                <div className="text-[#6F6A60]">{activeCampus?.address}, {activeCampus?.city}</div>
              </div>
              <div className="custom-card p-5 space-y-2">
                <h4 className="font-serif font-bold text-[#17243A] text-sm">Active Institute</h4>
                <div className="font-bold text-[#722B2B]">{activeInstitute?.name} ({activeInstitute?.code})</div>
                <div className="text-[#6F6A60]">Institute Type: {activeInstitute?.type}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Registered System User Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-[#F8F4EC] rounded-lg overflow-hidden border border-[#D8C28A]">
                <thead className="bg-[#17243A] text-[#C9A85C] uppercase font-semibold">
                  <tr>
                    <th className="p-3">User Email</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C28A]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#EFE8DA]">
                      <td className="p-3 font-bold text-[#17243A]">{u.email}</td>
                      <td className="p-3">
                        <Badge variant="navy">{u.role_name || 'ORGANIZATION_ADMIN'}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.is_active ? 'active' : 'inactive'}>
                          {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </td>
                      <td className="p-3 text-[#6F6A60]">{u.last_login_at || 'Recently active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Roles & RBAC Matrix */}
        {activeTab === 'roles' && (
          <div className="space-y-6 text-xs">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">RBAC Role Permission Matrix</h3>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="custom-card p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
                    <span className="font-bold text-sm text-[#17243A]">{role.name}</span>
                    <span className="text-[10px] text-[#6F6A60]">{role.description}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {permissions.map((p) => {
                      const hasPerm = role.permissionIds?.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                            hasPerm
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-[#F8F4EC] text-[#6F6A60] border-[#D8C28A]/50 opacity-40'
                          }`}
                        >
                          {hasPerm && <Check className="w-3 h-3 text-emerald-700" />}
                          <span>{p.code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Admin Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs max-w-lg">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Logged-in Administrator Profile</h3>
            <div className="custom-card p-5 space-y-3">
              <div>
                <label className="block text-[#6F6A60] mb-1">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value="Dr. Rahul Sharma"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md font-bold text-[#17243A]"
                />
              </div>
              <div>
                <label className="block text-[#6F6A60] mb-1">Email Address</label>
                <input
                  type="text"
                  readOnly
                  value="admin@campusaum.edu"
                  className="w-full text-xs p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
