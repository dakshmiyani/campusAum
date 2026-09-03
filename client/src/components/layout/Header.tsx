import React, { useEffect, useRef, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { Landmark, Layers3, GraduationCap, Bell, ShieldCheck, ChevronDown, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    campuses,
    institutes,
    activeCampus,
    activeInstitute,
    setActiveCampus,
    setActiveInstitute,
    addCampus,
    addInstitute,
    phases,
    activePhase,
    setActivePhase,
    addPhase,
  } = useTenant();
  const [openMenu, setOpenMenu] = useState<'campus' | 'phase' | 'education' | null>(null);
  const [modalType, setModalType] = useState<'campus' | 'phase' | 'education' | null>(null);
  const [campusForm, setCampusForm] = useState({ name: '', code: '', address: '', city: '', state: '', pincode: '' });
  const [isSavingCampus, setIsSavingCampus] = useState(false);
  const [campusError, setCampusError] = useState('');
  const [educationForm, setEducationForm] = useState({ name: '', code: '', type: 'ENGINEERING', address: '' });
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const openAdd = (type: 'campus' | 'phase' | 'education') => {
    setOpenMenu(null);
    setCampusError('');
    setCampusForm({ name: '', code: '', address: '', city: '', state: '', pincode: '' });
    setEducationForm({ name: '', code: '', type: 'ENGINEERING', address: '' });
    setModalType(type);
  };

  const handleAddCampus = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!campusForm.name.trim() || !campusForm.code.trim()) {
      setCampusError('Campus name and code are required.');
      return;
    }

    setIsSavingCampus(true);
    setCampusError('');
    try {
      await addCampus(campusForm);
      setModalType(null);
    } catch (error: any) {
      setCampusError(
        error.response?.data?.message
          || (error.request ? 'Campus API is unavailable. Start the server on port 5002.' : 'Unable to create campus.'),
      );
    } finally {
      setIsSavingCampus(false);
    }
  };

  const handleAddPhase = (event: React.FormEvent) => {
    event.preventDefault();
    if (!campusForm.name.trim()) {
      setCampusError('Phase name is required.');
      return;
    }
    addPhase(campusForm.name);
    setActivePhase(campusForm.name.trim());
    setModalType(null);
  };

  const handleAddEducation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!educationForm.name.trim() || !educationForm.code.trim() || !activeCampus) {
      setCampusError('Education name, code, and a selected campus are required.');
      return;
    }
    setIsSavingCampus(true);
    try {
      await addInstitute({ ...educationForm, campus_id: activeCampus.id });
      setModalType(null);
    } catch (error: any) {
      setCampusError(error.response?.data?.message || 'Unable to create education.');
    } finally {
      setIsSavingCampus(false);
    }
  };

  const renderAddAction = (type: 'campus' | 'phase' | 'education', label: string) => (
    <button
      type="button"
      onClick={() => openAdd(type)}
      className="flex w-full items-center gap-2 border-t border-[#D8C28A] px-3 py-2.5 text-left text-[11px] font-bold text-[#722B2B] hover:bg-[#F8F4EC]"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  const renderSwitcher = (
    type: 'campus' | 'phase' | 'education',
    icon: React.ReactNode,
    label: string,
    value: string,
    children: React.ReactNode,
  ) => (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpenMenu(openMenu === type ? null : type)}
        className="flex items-center gap-1.5 rounded-lg border border-[#D8C28A] bg-[#F8F4EC] px-2.5 py-1.5 text-xs font-semibold text-[#17243A] hover:bg-white"
        aria-expanded={openMenu === type}
      >
        {icon}
        <span className="max-w-[130px] truncate sm:max-w-[190px]">{value || label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[#6F6A60]" />
      </button>
      {openMenu === type && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-72 min-w-[220px] overflow-y-auto rounded-lg border border-[#D8C28A] bg-[#EFE8DA] py-1 text-xs shadow-lg">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#6F6A60]">{label}</div>
          {children}
          {renderAddAction(type, type === 'campus' ? 'Add new campus' : type === 'phase' ? 'Add new phase' : 'Add education')}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D8C28A] bg-[#EFE8DA] px-4 shadow-xs md:px-6">
      {/* Multi-Tenant Scope Switcher */}
      <div ref={switcherRef} className="flex min-w-0 items-center gap-2 py-1 text-xs md:gap-3">
        {renderSwitcher('campus', <Landmark className="h-3.5 w-3.5 shrink-0 text-[#C9A85C]" />, 'Campus', activeCampus?.name || 'Select campus', campuses.map((campus) => (
          <button key={campus.id} type="button" onClick={() => { setActiveCampus(campus); setOpenMenu(null); }} className={`block w-full px-3 py-2 text-left hover:bg-[#F8F4EC] ${activeCampus?.id === campus.id ? 'font-bold text-[#722B2B]' : 'text-[#17243A]'}`}>
            <span>{campus.name}</span><span className="ml-2 text-[10px] text-[#6F6A60]">{campus.code}</span>
          </button>
        )))}

        <span className="shrink-0 font-bold text-[#6F6A60]">/</span>

        {renderSwitcher('phase', <Layers3 className="h-3.5 w-3.5 shrink-0 text-[#C9A85C]" />, 'Phase', activePhase, [
          <button key="all-phases" type="button" onClick={() => { setActivePhase('All Phases'); setOpenMenu(null); }} className={`block w-full px-3 py-2 text-left hover:bg-[#F8F4EC] ${activePhase === 'All Phases' ? 'font-bold text-[#722B2B]' : 'text-[#17243A]'}`}>All Phases</button>,
          ...phases.map((phase) => <button key={phase} type="button" onClick={() => { setActivePhase(phase); setOpenMenu(null); }} className={`block w-full px-3 py-2 text-left hover:bg-[#F8F4EC] ${activePhase === phase ? 'font-bold text-[#722B2B]' : 'text-[#17243A]'}`}>{phase}</button>),
        ])}

        <span className="shrink-0 font-bold text-[#6F6A60]">/</span>

        {renderSwitcher('education', <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#C9A85C]" />, 'Education', activeInstitute ? `${activeInstitute.code} - ${activeInstitute.name}` : 'Select education', institutes.map((institute) => (
          <button key={institute.id} type="button" onClick={() => { setActiveInstitute(institute); setOpenMenu(null); }} className={`block w-full px-3 py-2 text-left hover:bg-[#F8F4EC] ${activeInstitute?.id === institute.id ? 'font-bold text-[#722B2B]' : 'text-[#17243A]'}`}>
            {institute.code} - {institute.name}
          </button>
        )))}
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
        <button
          type="button"
          onClick={() => navigate('/settings?tab=profile')}
          className="flex items-center space-x-2 rounded-lg border-l border-[#D8C28A] pl-2 text-left hover:bg-[#F8F4EC]"
          title="View administrator profile"
        >
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
        </button>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17243A]/50 p-4" role="dialog" aria-modal="true" aria-labelledby="add-scope-title">
          <form onSubmit={modalType === 'campus' ? handleAddCampus : modalType === 'phase' ? handleAddPhase : handleAddEducation} className="w-full max-w-lg rounded-xl border border-[#D8C28A] bg-[#F8F4EC] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#D8C28A] pb-3">
              <div>
                <h2 id="add-scope-title" className="font-serif text-lg font-bold text-[#17243A]">Add New {modalType}</h2>
                <p className="text-[11px] text-[#6F6A60]">Create a new {modalType} for the active dashboard scope.</p>
              </div>
              <button type="button" onClick={() => setModalType(null)} className="rounded-md p-1.5 text-[#6F6A60] hover:bg-[#EFE8DA] hover:text-[#17243A]" aria-label="Close dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalType === 'phase' ? (
              <label>
                <span className="mb-1 block text-[11px] font-bold text-[#17243A]">Phase name *</span>
                <input required value={campusForm.name} onChange={(event) => setCampusForm({ ...campusForm, name: event.target.value })} className="w-full rounded-md border border-[#D8C28A] bg-white px-3 py-2 text-xs text-[#17243A] outline-none focus:border-[#C9A85C]" />
              </label>
            ) : modalType === 'education' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['name', 'Education name'],
                  ['code', 'Education code'],
                  ['type', 'Type'],
                  ['address', 'Address'],
                ].map(([field, label]) => (
                  <label key={field} className={field === 'address' ? 'sm:col-span-2' : ''}>
                    <span className="mb-1 block text-[11px] font-bold text-[#17243A]">{label} *</span>
                    <input required value={educationForm[field as keyof typeof educationForm]} onChange={(event) => setEducationForm({ ...educationForm, [field]: event.target.value })} className="w-full rounded-md border border-[#D8C28A] bg-white px-3 py-2 text-xs text-[#17243A] outline-none focus:border-[#C9A85C]" />
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                ['name', 'Campus name', true],
                ['code', 'Campus code', true],
                ['address', 'Address', false],
                ['city', 'City', false],
                ['state', 'State', false],
                ['pincode', 'Pincode', false],
                ].map(([field, label, required]) => (
                <label key={field as string} className={field === 'address' ? 'sm:col-span-2' : ''}>
                  <span className="mb-1 block text-[11px] font-bold text-[#17243A]">{label as string}{required ? ' *' : ''}</span>
                  <input
                    required={required as boolean}
                    value={campusForm[field as keyof typeof campusForm]}
                    onChange={(event) => setCampusForm({ ...campusForm, [field as string]: event.target.value })}
                    className="w-full rounded-md border border-[#D8C28A] bg-white px-3 py-2 text-xs text-[#17243A] outline-none focus:border-[#C9A85C]"
                  />
                </label>
                ))}
              </div>
            )}

            {campusError && <p className="mt-3 text-xs font-semibold text-[#722B2B]">{campusError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setModalType(null)} className="rounded-md border border-[#D8C28A] px-3 py-2 text-xs font-bold text-[#17243A] hover:bg-[#EFE8DA]">Cancel</button>
              <button type="submit" disabled={isSavingCampus} className="rounded-md bg-[#17243A] px-3 py-2 text-xs font-bold text-[#C9A85C] hover:bg-[#243552] disabled:cursor-not-allowed disabled:opacity-60">{isSavingCampus ? 'Creating...' : `Create ${modalType}`}</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

