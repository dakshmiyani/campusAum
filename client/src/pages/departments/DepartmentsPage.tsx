import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Department } from '../../types';
import { Building, Plus, Users, UserCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useTenant } from '../../contexts/TenantContext';

export const DepartmentsPage: React.FC = () => {
  const { activeInstitute } = useTenant();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadDepts() {
      setLoading(true);
      try {
        const res = await api.get('/departments');
        setDepartments(res.data.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDepts();
  }, [activeInstitute]);

  const handleCreate = async () => {
    if (!name || !code) return;
    try {
      await api.post('/departments', { name, code, description });
      alert('Department created successfully!');
      setShowModal(false);
      setName('');
      setCode('');
      setDescription('');
      const res = await api.get('/departments');
      setDepartments(res.data.data);
    } catch (err) {
      alert('Failed to create department.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Academic & Administrative Departments</h1>
          <p className="text-xs text-[#6F6A60]">
            Manage institutional departments, HOD allocations, and headcount
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-[#C9A85C] text-[#17243A] px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#D9BE7A] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#6F6A60]">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div key={dept.id} className="custom-card p-5 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
                  <span className="font-mono font-bold text-xs text-[#722B2B] bg-[#722B2B]/10 px-2 py-0.5 rounded-md">
                    {dept.code}
                  </span>
                  <Badge variant="active">ACTIVE</Badge>
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

      {/* Add Dept Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-[#17243A]">Create New Department</h3>
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
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. DSCS"
                className="w-full text-xs p-2 bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A]"
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
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 text-xs text-[#17243A] bg-[#F8F4EC] border border-[#D8C28A] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-xs font-bold bg-[#C9A85C] text-[#17243A] rounded-md hover:bg-[#D9BE7A]"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
