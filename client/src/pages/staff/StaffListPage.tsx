import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { StaffListItem, Department, Designation } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Download, Mail, Phone, Eye, Trash2, Filter, Landmark, GraduationCap } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';

export const StaffListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { campuses, institutes, activeCampus, activeInstitute, setActiveCampus, setActiveInstitute } = useTenant();

  const [staffList, setStaffList] = useState<StaffListItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [dRes, desRes] = await Promise.all([
          api.get('/departments'),
          api.get('/designations'),
        ]);
        setDepartments(dRes.data.data);
        setDesignations(desRes.data.data);
      } catch (err) {
        console.error('Error fetching filter metadata:', err);
      }
    }
    loadFilterOptions();
  }, [activeInstitute]);

  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      try {
        let url = `/staff?search=${encodeURIComponent(search)}`;
        if (activeCampus) url += `&campusId=${activeCampus.id}`;
        if (activeInstitute) url += `&instituteId=${activeInstitute.id}`;
        if (selectedDept) url += `&departmentId=${selectedDept}`;
        if (selectedType) url += `&staffType=${selectedType}`;
        if (selectedStatus) url += `&status=${selectedStatus}`;

        const res = await api.get(url);
        setStaffList(res.data.data);
      } catch (err) {
        console.error('Error fetching staff list:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchStaff, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedType, selectedStatus, activeInstitute, activeCampus]);

  const exportToCSV = () => {
    const headers = ['Employee Code', 'Full Name', 'Department', 'Designation', 'Staff Type', 'Status', 'Email', 'Mobile'];
    const rows = staffList.map((s) => [
      s.employee_code,
      `"${s.first_name} ${s.last_name}"`,
      `"${s.department_name}"`,
      `"${s.designation_name}"`,
      s.staff_type,
      s.status,
      s.official_email,
      s.official_mobile,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusAUM_Staff_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeactivate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (confirm(`Are you sure you want to change staff status to ${newStatus}?`)) {
      try {
        await api.patch(`/staff/${id}/status`, { status: newStatus });
        setStaffList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
        );
      } catch (err) {
        alert('Failed to update status.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Staff Directory</h1>
          <p className="text-xs text-[#6F6A60]">
            Comprehensive roster of teaching faculty and non-teaching administrative staff for{' '}
            <strong className="text-[#17243A]">{activeCampus?.name || 'Selected Campus'}</strong>
            {activeInstitute && <span> — ({activeInstitute.name})</span>}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-2 bg-[#EFE8DA] text-[#17243A] border border-[#D8C28A] px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#F8F4EC] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A85C]" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/staff/new"
            className="inline-flex items-center space-x-2 bg-[#C9A85C] text-[#17243A] px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-[#D9BE7A] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Staff</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#6F6A60] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F4EC] border border-[#D8C28A] rounded-md text-[#17243A] focus:outline-hidden focus:border-[#C9A85C]"
          />
        </div>

        {/* Campus Scope Filter */}
        <div className="flex items-center space-x-1.5 bg-[#F8F4EC] px-2.5 py-1.5 rounded-md border border-[#D8C28A]">
          <Landmark className="w-3.5 h-3.5 text-[#C9A85C]" />
          <select
            value={activeCampus?.id || ''}
            onChange={(e) => {
              const selected = campuses.find((c) => c.id === e.target.value);
              if (selected) setActiveCampus(selected);
            }}
            className="bg-transparent text-xs text-[#17243A] font-bold focus:outline-hidden cursor-pointer"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Institute Scope Filter (Cascaded by Campus) */}
        <div className="flex items-center space-x-1.5 bg-[#F8F4EC] px-2.5 py-1.5 rounded-md border border-[#D8C28A]">
          <GraduationCap className="w-3.5 h-3.5 text-[#C9A85C]" />
          <select
            value={activeInstitute?.id || ''}
            onChange={(e) => {
              const selected = institutes.find((i) => i.id === e.target.value);
              if (selected) setActiveInstitute(selected);
            }}
            className="bg-transparent text-xs text-[#17243A] font-bold focus:outline-hidden cursor-pointer"
          >
            {institutes.length === 0 ? (
              <option value="">No Institutes</option>
            ) : (
              institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} — {inst.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-[#6F6A60]" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#F8F4EC] border border-[#D8C28A] text-[#17243A] text-xs rounded-md px-3 py-1.5 focus:outline-hidden"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* Staff Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[#F8F4EC] border border-[#D8C28A] text-[#17243A] text-xs rounded-md px-3 py-1.5 focus:outline-hidden"
        >
          <option value="">All Staff Types</option>
          <option value="TEACHING">Teaching Faculty</option>
          <option value="NON_TEACHING">Non-Teaching Staff</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#F8F4EC] border border-[#D8C28A] text-[#17243A] text-xs rounded-md px-3 py-1.5 focus:outline-hidden"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>

        {(search || selectedDept || selectedType || selectedStatus) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('');
              setSelectedType('');
              setSelectedStatus('');
            }}
            className="text-xs text-[#722B2B] font-semibold hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Staff Data Table */}
      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6F6A60]">Loading staff directory...</div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6F6A60]">
            No staff records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#17243A] text-[#C9A85C] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Staff Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C28A]/50 bg-[#F8F4EC]">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#EFE8DA]/80 transition-colors">
                    {/* Staff Profile cell */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            staff.photo_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={staff.first_name}
                          className="w-9 h-9 rounded-full object-cover border border-[#C9A85C]"
                        />
                        <div>
                          <Link
                            to={`/staff/${staff.id}`}
                            className="font-bold text-[#17243A] hover:text-[#722B2B] transition-colors"
                          >
                            {staff.first_name} {staff.middle_name ? `${staff.middle_name} ` : ''}
                            {staff.last_name}
                          </Link>
                          <div className="text-[10px] text-[#6F6A60] flex items-center space-x-2 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-[#C9A85C]" />
                              <span>{staff.official_email}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-[#C9A85C]" />
                              <span>{staff.official_mobile}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Employee Code */}
                    <td className="py-3 px-4 font-mono font-bold text-[#17243A]">
                      {staff.employee_code}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#17243A]">{staff.department_name}</div>
                      <div className="text-[10px] text-[#6F6A60]">{staff.department_code}</div>
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4 font-medium text-[#17243A]">
                      {staff.designation_name}
                    </td>

                    {/* Staff Type */}
                    <td className="py-3 px-4">
                      <Badge variant={staff.staff_type === 'TEACHING' ? 'teaching' : 'non-teaching'}>
                        {staff.staff_type === 'TEACHING' ? 'Teaching' : 'Non-Teaching'}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge variant={staff.status === 'ACTIVE' ? 'active' : 'inactive'}>
                        ● {staff.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/staff/${staff.id}`}
                          className="p-1.5 bg-[#EFE8DA] text-[#17243A] hover:bg-[#C9A85C] rounded-md transition-colors border border-[#D8C28A]"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeactivate(staff.id, staff.status)}
                          className="p-1.5 bg-[#722B2B]/10 text-[#722B2B] hover:bg-[#722B2B] hover:text-white rounded-md transition-colors border border-[#722B2B]/30"
                          title="Toggle Active Status"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
