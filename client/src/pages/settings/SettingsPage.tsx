import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useTenant } from '../../contexts/TenantContext';
import { Building, Users, Shield, User, Plus, Landmark, GraduationCap, Check, X, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'institution';
  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    activeOrg,
    activeCampus,
    activeInstitute,
    campuses,
    institutes,
    addCampus,
    updateCampus,
    deleteCampus,
    addInstitute,
    updateInstitute,
    deleteInstitute,
    refreshTenants,
  } = useTenant();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allInstitutes, setAllInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for Super Admin
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [showInstituteModal, setShowInstituteModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState<any | null>(null);
  const [editingInstitute, setEditingInstitute] = useState<any | null>(null);

  // Campus Form State
  const [campusForm, setCampusForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Institute Form State
  const [instituteForm, setInstituteForm] = useState({
    campus_id: '',
    name: '',
    code: '',
    type: 'ENGINEERING',
    address: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'institution');
  }, [searchParams]);

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, aRes, instRes] = await Promise.all([
        api.get('/settings/users'),
        api.get('/settings/roles'),
        api.get('/settings/audit-logs'),
        api.get('/institutes?campusId=all'),
      ]);
      setUsers(uRes.data.data);
      setRoles(rRes.data.data.roles);
      setPermissions(rRes.data.data.permissions);
      setAuditLogs(aRes.data.data);
      setAllInstitutes(instRes.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, [activeOrg]);

  const handleSaveCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusForm.name || !campusForm.code) {
      alert('Please provide Campus Name and Code');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCampus) {
        await updateCampus(editingCampus.id, campusForm);
        alert('Campus updated successfully!');
      } else {
        await addCampus(campusForm);
        alert('Campus created successfully!');
      }
      setShowCampusModal(false);
      setEditingCampus(null);
      setCampusForm({ name: '', code: '', address: '', city: '', state: 'Maharashtra', pincode: '' });
      await refreshTenants();
      await loadSettingsData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save campus.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampus = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate ${name}? All constituent institutes under this campus will also be deactivated.`)) {
      try {
        await deleteCampus(id);
        alert('Campus deactivated successfully.');
        await refreshTenants();
        await loadSettingsData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete campus.');
      }
    }
  };

  const handleSaveInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCampusId = instituteForm.campus_id || (activeCampus ? activeCampus.id : campuses[0]?.id);
    if (!instituteForm.name || !instituteForm.code || !targetCampusId) {
      alert('Please select Campus, enter Institute Name and Code');
      return;
    }
    setSubmitting(true);
    try {
      if (editingInstitute) {
        await updateInstitute(editingInstitute.id, {
          ...instituteForm,
          campus_id: targetCampusId,
        });
        alert('Institute updated successfully!');
      } else {
        await addInstitute({
          ...instituteForm,
          campus_id: targetCampusId,
        });
        alert('Institute created successfully!');
      }
      setShowInstituteModal(false);
      setEditingInstitute(null);
      setInstituteForm({ campus_id: '', name: '', code: '', type: 'ENGINEERING', address: '' });
      await refreshTenants();
      await loadSettingsData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save institute.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInstitute = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate ${name}?`)) {
      try {
        await deleteInstitute(id);
        alert('Institute deactivated successfully.');
        await refreshTenants();
        await loadSettingsData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete institute.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D8C28A] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">System Settings & Administration</h1>
          <p className="text-xs text-[#6F6A60]">
            Institutional scope configuration, user management, RBAC permission matrix & system security
          </p>
        </div>

        {/* Super Admin Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingCampus(null);
              setCampusForm({ name: '', code: '', address: '', city: '', state: 'Maharashtra', pincode: '' });
              setShowCampusModal(true);
            }}
            className="inline-flex items-center space-x-1.5 bg-[#17243A] text-[#C9A85C] px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#243552] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Campus</span>
          </button>

          <button
            onClick={() => {
              setEditingInstitute(null);
              setInstituteForm({ campus_id: activeCampus?.id || campuses[0]?.id || '', name: '', code: '', type: 'ENGINEERING', address: '' });
              setShowInstituteModal(true);
            }}
            className="inline-flex items-center space-x-1.5 bg-[#C9A85C] text-[#17243A] px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#D9BE7A] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Institute</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#D8C28A] text-xs font-semibold text-[#6F6A60] bg-[#EFE8DA] rounded-t-xl overflow-hidden border">
        {[
          { id: 'institution', name: 'Campus & Institute Scope', icon: Building },
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
          );
        })}
      </div>

      {/* Content Container */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-b-xl p-6 shadow-xs">
        {/* Tab 1: Institution Details */}
        {activeTab === 'institution' && (
          <div className="space-y-6 text-xs">
            {/* Active Trust Banner */}
            <div className="custom-card p-5 space-y-3">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2">
                Active Organization / Trust Scope
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Master Roster of Campuses & Institutes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#17243A]">Master Campus & Institute Roster</h3>
                  <p className="text-[11px] text-[#6F6A60]">Full list of registered campuses and constituent institutes in this trust</p>
                </div>
                <span className="text-xs font-bold text-[#17243A] bg-[#F8F4EC] border border-[#D8C28A] px-3 py-1 rounded-md">
                  Total Campuses: {campuses.length} | Total Institutes: {allInstitutes.length}
                </span>
              </div>

              <div className="space-y-4">
                {campuses.map((c) => {
                  const campusInsts = allInstitutes.filter((i) => i.campus_id === c.id);
                  const isCurrentCampus = activeCampus?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`custom-card p-5 space-y-3 transition-all ${
                        isCurrentCampus ? 'ring-2 ring-[#C9A85C]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#D8C28A]/60 pb-3 flex-wrap gap-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-[#17243A] text-[#C9A85C] rounded-lg">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-sm text-[#17243A]">{c.name}</h4>
                              <span className="font-mono text-xs font-bold text-[#722B2B] bg-[#722B2B]/10 px-2 py-0.5 rounded-md border border-[#722B2B]/20">
                                {c.code}
                              </span>
                              {isCurrentCampus && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                  Current Selected Campus
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#6F6A60] flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#C9A85C]" />
                              <span>{c.address ? `${c.address}, ` : ''}{c.city}, {c.state} {c.pincode ? `- ${c.pincode}` : ''}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingCampus(c);
                              setCampusForm({
                                name: c.name,
                                code: c.code,
                                address: c.address || '',
                                city: c.city || '',
                                state: c.state || '',
                                pincode: c.pincode || '',
                              });
                              setShowCampusModal(true);
                            }}
                            className="text-xs font-semibold text-[#17243A] hover:bg-[#F8F4EC] flex items-center space-x-1 border border-[#D8C28A] px-2.5 py-1.5 rounded-md cursor-pointer"
                            title="Edit Campus"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#C9A85C]" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCampus(c.id, c.name)}
                            className="text-xs font-semibold text-[#722B2B] hover:bg-[#722B2B]/10 flex items-center space-x-1 border border-[#722B2B]/30 px-2 py-1.5 rounded-md cursor-pointer"
                            title="Deactivate Campus"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#722B2B]" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingInstitute(null);
                              setInstituteForm({ campus_id: c.id, name: '', code: '', type: 'ENGINEERING', address: '' });
                              setShowInstituteModal(true);
                            }}
                            className="text-xs font-bold text-[#722B2B] hover:underline flex items-center space-x-1 bg-[#F8F4EC] border border-[#D8C28A] px-3 py-1.5 rounded-md cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Institute</span>
                          </button>
                        </div>
                      </div>

                      {/* Child Institutes List */}
                      <div>
                        <div className="text-[11px] font-bold text-[#6F6A60] uppercase tracking-wider mb-2">
                          Institutes under {c.name} ({campusInsts.length}):
                        </div>

                        {campusInsts.length === 0 ? (
                          <div className="text-xs text-[#6F6A60] italic bg-[#F8F4EC] p-3 rounded-md border border-[#D8C28A]/40">
                            No institutes registered under this campus yet. Click "+ Institute" above.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {campusInsts.map((inst) => {
                              const isCurrentInst = activeInstitute?.id === inst.id;
                              return (
                                <div
                                  key={inst.id}
                                  className={`p-3 rounded-lg bg-[#F8F4EC] border transition-all ${
                                    isCurrentInst ? 'border-[#C9A85C] bg-[#C9A85C]/10 shadow-xs' : 'border-[#D8C28A]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5 gap-1">
                                    <span className="font-bold text-xs text-[#17243A] truncate">{inst.name}</span>
                                    <div className="flex items-center space-x-1 shrink-0">
                                      <span className="font-mono text-[10px] font-bold text-[#722B2B] bg-[#722B2B]/10 px-1.5 py-0.5 rounded">
                                        {inst.code}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setEditingInstitute(inst);
                                          setInstituteForm({
                                            campus_id: inst.campus_id,
                                            name: inst.name,
                                            code: inst.code,
                                            type: inst.type || 'ENGINEERING',
                                            address: inst.address || '',
                                          });
                                          setShowInstituteModal(true);
                                        }}
                                        className="p-1 hover:bg-[#D8C28A]/40 rounded text-[#17243A] cursor-pointer"
                                        title="Edit Institute"
                                      >
                                        <Pencil className="w-3 h-3 text-[#C9A85C]" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInstitute(inst.id, inst.name)}
                                        className="p-1 hover:bg-[#722B2B]/10 rounded text-[#722B2B] cursor-pointer"
                                        title="Deactivate Institute"
                                      >
                                        <Trash2 className="w-3 h-3 text-[#722B2B]" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-[#6F6A60] flex items-center justify-between">
                                    <span>Type: <strong className="text-[#17243A]">{inst.type}</strong></span>
                                    <Badge variant={inst.status === 'ACTIVE' ? 'active' : 'inactive'}>
                                      {inst.status}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Registered System User Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFE8DA] text-[#6F6A60] font-semibold border-b border-[#D8C28A]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Campus Scope</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C28A]/40 bg-[#F8F4EC]">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3 font-bold text-[#17243A]">
                        {u.first_name} {u.last_name}
                        <div className="text-[10px] font-normal text-[#6F6A60]">{u.official_email}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] font-bold bg-[#17243A] text-[#C9A85C] px-2 py-0.5 rounded-md">
                          {u.role_name}
                        </span>
                      </td>
                      <td className="p-3 text-[#17243A]">{u.designation_name || 'System Admin'}</td>
                      <td className="p-3 text-[#6F6A60]">{u.campus_name || 'All Campuses'}</td>
                      <td className="p-3">
                        <Badge variant="active">ACTIVE</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Roles & Permissions */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#17243A]">Role-Based Access Control (RBAC) Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((r) => (
                <div key={r.id} className="custom-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
                    <span className="font-bold text-sm text-[#17243A]">{r.name}</span>
                    <Badge variant="navy">ROLE</Badge>
                  </div>
                  <p className="text-[#6F6A60] text-xs">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Admin Profile */}
        {activeTab === 'profile' && (
          <div className="custom-card p-6 max-w-lg space-y-4">
            <h3 className="font-serif font-bold text-base text-[#17243A] border-b border-[#D8C28A] pb-2">
              Super Admin Profile & Credentials
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#6F6A60] block">Name</span>
                <span className="font-bold text-[#17243A]">Dr. Rahul Sharma</span>
              </div>
              <div>
                <span className="text-[#6F6A60] block">Designation</span>
                <span className="font-semibold text-[#17243A]">Chief Academic Officer & Institutional Administrator</span>
              </div>
              <div>
                <span className="text-[#6F6A60] block">Official Email</span>
                <span className="font-semibold text-[#17243A]">rahul.sharma@apexeducation.org</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT CAMPUS */}
      {showCampusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#EFE8DA] border-2 border-[#D8C28A] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-3">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-[#C9A85C]" />
                <h3 className="font-serif font-bold text-base text-[#17243A]">
                  {editingCampus ? 'Super Admin: Edit Campus Details' : 'Super Admin: Add New Campus'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCampusModal(false);
                  setEditingCampus(null);
                }}
                className="p-1 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCampus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#17243A] mb-1">Campus Name *</label>
                <input
                  type="text"
                  value={campusForm.name}
                  onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                  placeholder="e.g. Apex North Campus"
                  className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17243A] mb-1">Campus Code *</label>
                <input
                  type="text"
                  value={campusForm.code}
                  onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CAMPUS-NORTH"
                  className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] font-mono font-bold rounded-md text-[#17243A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17243A] mb-1">Street Address</label>
                <input
                  type="text"
                  value={campusForm.address}
                  onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })}
                  placeholder="e.g. Plot No 14, Educational Zone"
                  className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17243A] mb-1">City</label>
                  <input
                    type="text"
                    value={campusForm.city}
                    onChange={(e) => setCampusForm({ ...campusForm, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#17243A] mb-1">Pincode</label>
                  <input
                    type="text"
                    value={campusForm.pincode}
                    onChange={(e) => setCampusForm({ ...campusForm, pincode: e.target.value })}
                    placeholder="e.g. 400001"
                    className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#D8C28A]">
                <button
                  type="button"
                  onClick={() => {
                    setShowCampusModal(false);
                    setEditingCampus(null);
                  }}
                  className="px-4 py-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-lg text-[#17243A] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#17243A] text-[#C9A85C] rounded-lg font-bold hover:bg-[#243552]"
                >
                  {submitting ? 'Saving Campus...' : editingCampus ? 'Update Campus ✓' : 'Create Campus ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT INSTITUTE */}
      {showInstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#EFE8DA] border-2 border-[#D8C28A] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-[#C9A85C]" />
                <h3 className="font-serif font-bold text-base text-[#17243A]">
                  {editingInstitute ? 'Super Admin: Edit Institute Details' : 'Super Admin: Add New Institute'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowInstituteModal(false);
                  setEditingInstitute(null);
                }}
                className="p-1 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInstitute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#17243A] mb-1">Select Campus *</label>
                <select
                  value={instituteForm.campus_id}
                  onChange={(e) => setInstituteForm({ ...instituteForm, campus_id: e.target.value })}
                  className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A] font-bold"
                  required
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#17243A] mb-1">Institute Name *</label>
                <input
                  type="text"
                  value={instituteForm.name}
                  onChange={(e) => setInstituteForm({ ...instituteForm, name: e.target.value })}
                  placeholder="e.g. Institute of Management Studies"
                  className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17243A] mb-1">Institute Code *</label>
                  <input
                    type="text"
                    value={instituteForm.code}
                    onChange={(e) => setInstituteForm({ ...instituteForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. IMS"
                    className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] font-mono font-bold rounded-md text-[#17243A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17243A] mb-1">Institute Type</label>
                  <select
                    value={instituteForm.type}
                    onChange={(e) => setInstituteForm({ ...instituteForm, type: e.target.value })}
                    className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                  >
                    <option value="ENGINEERING">ENGINEERING</option>
                    <option value="MANAGEMENT">MANAGEMENT</option>
                    <option value="SCIENCE">SCIENCE</option>
                    <option value="MEDICAL">MEDICAL</option>
                    <option value="ARTS">ARTS</option>
                    <option value="PHARMACY">PHARMACY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#17243A] mb-1">Address / Building</label>
                <input
                  type="text"
                  value={instituteForm.address}
                  onChange={(e) => setInstituteForm({ ...instituteForm, address: e.target.value })}
                  placeholder="e.g. Block B, Academic Complex"
                  className="w-full p-2.5 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#D8C28A]">
                <button
                  type="button"
                  onClick={() => {
                    setShowInstituteModal(false);
                    setEditingInstitute(null);
                  }}
                  className="px-4 py-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-lg text-[#17243A] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#C9A85C] text-[#17243A] rounded-lg font-bold hover:bg-[#D9BE7A]"
                >
                  {submitting ? 'Saving Institute...' : editingInstitute ? 'Update Institute ✓' : 'Create Institute ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
