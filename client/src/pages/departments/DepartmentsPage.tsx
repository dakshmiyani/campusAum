import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Department, Institute } from '../../types';
import { Building, Plus, Landmark, GraduationCap, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useTenant } from '../../contexts/TenantContext';

export const DepartmentsPage: React.FC = () => {
  const { campuses, institutes, activeCampus, activeInstitute } = useTenant();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Modal form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCampusId, setSelectedCampusId] = useState(activeCampus?.id || '');
  const [selectedInstituteId, setSelectedInstituteId] = useState(activeInstitute?.id || '');

  const loadDepts = async () => {
    setLoading(true);
    try {
      let url = '/departments';
      if (activeCampus) {
        url += `?campusId=${activeCampus.id}`;
        if (activeInstitute) {
          url += `&instituteId=${activeInstitute.id}`;
        }
      }
      const res = await api.get(url);
      setDepartments(res.data.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepts();
  }, [activeCampus, activeInstitute]);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setSelectedCampusId(activeCampus?.id || (campuses.length > 0 ? campuses[0].id : ''));
    setSelectedInstituteId(activeInstitute?.id || (institutes.length > 0 ? institutes[0].id : ''));
    setShowModal(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
    setSelectedCampusId(dept.campus_id || activeCampus?.id || (campuses.length > 0 ? campuses[0].id : ''));
    setSelectedInstituteId(dept.institute_id || activeInstitute?.id || '');
    setShowModal(true);
  };

  const [modalInstitutes, setModalInstitutes] = useState<Institute[]>([]);

  useEffect(() => {
    if (!selectedCampusId) return;
    async function loadModalInstitutes() {
      try {
        const res = await api.get(`/institutes?campusId=${selectedCampusId}`);
        const insts: Institute[] = res.data.data;
        setModalInstitutes(insts);
        if (insts.length > 0) {
          setSelectedInstituteId((prev) => (insts.some((i) => i.id === prev) ? prev : insts[0].id));
        } else {
          setSelectedInstituteId('');
        }
      } catch (err) {
        console.error('Error fetching institutes for selected campus:', err);
      }
    }
    loadModalInstitutes();
  }, [selectedCampusId]);

  const handleSave = async () => {
    if (!name || !code) {
      alert('Please enter Department Name and Code');
      return;
    }
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, {
          name,
          code: code.toUpperCase(),
          description,
          campusId: selectedCampusId,
          instituteId: selectedInstituteId,
        });
        alert('Department updated successfully!');
      } else {
        await api.post('/departments', {
          name,
          code: code.toUpperCase(),
          description,
          campusId: selectedCampusId,
          instituteId: selectedInstituteId,
        });
        alert('Department created successfully!');
      }
      setShowModal(false);
      setEditingDept(null);
      setName('');
      setCode('');
      setDescription('');
      await loadDepts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save department.');
    }
  };

  const handleDelete = async (dept: Department) => {
    if (confirm(`Are you sure you want to deactivate department "${dept.name}"?`)) {
      try {
        await api.delete(`/departments/${dept.id}`);
        alert('Department deactivated successfully!');
        await loadDepts();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete department.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8C28A] pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Academic & Administrative Departments</h1>
          <p className="text-xs text-[#6F6A60]">
            Manage institutional departments, HOD allocations, and campus headcount for{' '}
            <strong className="text-[#17243A]">{activeCampus?.name || 'Selected Campus'}</strong>
            {activeInstitute && <span> — ({activeInstitute.name})</span>}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 bg-[#C9A85C] text-[#17243A] px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#D9BE7A] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#6F6A60]">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6F6A60] bg-[#EFE8DA] rounded-xl border border-[#D8C28A]">
          No departments found for the selected campus scope. Click <strong>+ Add Department</strong> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div key={dept.id} className="custom-card p-5 space-y-4 flex flex-col justify-between shadow-xs border border-[#D8C28A] rounded-xl bg-[#EFE8DA]">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
                  <span className="font-mono font-bold text-xs text-[#722B2B] bg-[#722B2B]/10 px-2 py-0.5 rounded-md">
                    {dept.code}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(dept)}
                      className="p-1 hover:bg-[#F8F4EC] rounded-md transition-colors cursor-pointer"
                      title="Edit Department"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#C9A85C]" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-1 hover:bg-[#722B2B]/10 rounded-md transition-colors cursor-pointer"
                      title="Deactivate Department"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#722B2B]" />
                    </button>
                    <Badge variant="active">ACTIVE</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-[#C9A85C] font-bold">
                  <Landmark className="w-3 h-3 shrink-0" />
                  <span className="truncate">{dept.campus_name || activeCampus?.name || 'Campus'}</span>
                  {dept.institute_code && (
                    <span className="bg-[#17243A] text-[#C9A85C] text-[9px] px-1.5 py-0.2 rounded-xs ml-1 font-mono">
                      {dept.institute_code}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-serif font-bold text-[#17243A]">{dept.name}</h3>
                <p className="text-xs text-[#6F6A60]">{dept.description || 'Institutional Academic Department'}</p>
              </div>

              <div className="pt-3 border-t border-[#D8C28A] flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-[#6F6A60] uppercase font-semibold">Head of Department (HOD)</div>
                  <div className="font-bold text-[#17243A]">
                    {dept.hod_first_name ? `Dr. ${dept.hod_first_name} ${dept.hod_last_name}` : 'Unassigned'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#6F6A60] uppercase font-semibold">Total Faculty</div>
                  <div className="font-mono font-bold text-[#722B2B]">{dept.staff_count || 0} Staff</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dept Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-3">
              <h3 className="text-base font-serif font-bold text-[#17243A]">
                {editingDept ? 'Edit Department Details' : 'Create New Department'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDept(null);
                }}
                className="p-1 rounded-md text-[#6F6A60] hover:text-[#17243A] hover:bg-[#F8F4EC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Target Campus */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Target Campus *</label>
              <div className="flex items-center space-x-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md px-2.5 py-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#C9A85C]" />
                <select
                  value={selectedCampusId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    setSelectedCampusId(cId);
                    const availableInsts = institutes.filter((i) => i.campus_id === cId);
                    setSelectedInstituteId(availableInsts.length > 0 ? availableInsts[0].id : '');
                  }}
                  className="w-full text-xs bg-transparent text-[#17243A] font-bold focus:outline-hidden cursor-pointer"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Institute */}
            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Target Institute *</label>
              <div className="flex items-center space-x-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md px-2.5 py-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#C9A85C]" />
                <select
                  value={selectedInstituteId}
                  onChange={(e) => setSelectedInstituteId(e.target.value)}
                  className="w-full text-xs bg-transparent text-[#17243A] font-bold focus:outline-hidden cursor-pointer"
                >
                  {modalInstitutes.length === 0 ? (
                    <option value="">No Institutes for this Campus</option>
                  ) : (
                    modalInstitutes.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.code} — {inst.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Department Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Science & Cyber Security"
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Department Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. DSCS"
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] font-mono font-bold rounded-md text-[#17243A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17243A] mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingDept(null);
                }}
                className="px-4 py-1.5 text-xs text-[#17243A] bg-[#F8F4EC] border border-[#D8C28A] rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-bold bg-[#C9A85C] text-[#17243A] rounded-md hover:bg-[#D9BE7A] cursor-pointer"
              >
                {editingDept ? 'Update Department ✓' : 'Create Department ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
