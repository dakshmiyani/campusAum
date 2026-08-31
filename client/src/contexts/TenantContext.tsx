import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setTenantHeaders } from '../services/api';
import { Organization, Campus, Institute } from '../types';

interface TenantContextType {
  organizations: Organization[];
  campuses: Campus[];
  institutes: Institute[];
  activeOrg: Organization | null;
  activeCampus: Campus | null;
  activeInstitute: Institute | null;
  setActiveOrg: (org: Organization) => void;
  setActiveCampus: (campus: Campus) => void;
  setActiveInstitute: (inst: Institute) => void;
  addCampus: (data: { name: string; code: string; address?: string; city?: string; state?: string; pincode?: string }) => Promise<void>;
  updateCampus: (id: string, data: Partial<Campus>) => Promise<void>;
  deleteCampus: (id: string) => Promise<void>;
  addInstitute: (data: { campus_id: string; name: string; code: string; type: string; address?: string }) => Promise<void>;
  updateInstitute: (id: string, data: Partial<Institute>) => Promise<void>;
  deleteInstitute: (id: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  const [activeOrg, setActiveOrgState] = useState<Organization | null>(null);
  const [activeCampus, setActiveCampusState] = useState<Campus | null>(null);
  const [activeInstitute, setActiveInstituteState] = useState<Institute | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadTenants = async () => {
    try {
      const orgRes = await api.get('/organizations');
      const orgs = orgRes.data.data;
      setOrganizations(orgs);

      if (orgs.length > 0) {
        const currentOrg = orgs[0];
        setActiveOrgState(currentOrg);

        const campusRes = await api.get(`/campuses?organization_id=${currentOrg.id}`);
        const camps: Campus[] = campusRes.data.data;
        setCampuses(camps);

        if (camps.length > 0) {
          const currentCampus = activeCampus && camps.some((c) => c.id === activeCampus.id)
            ? camps.find((c) => c.id === activeCampus.id)!
            : camps[0];

          setActiveCampusState(currentCampus);

          const instRes = await api.get(`/institutes?campusId=${currentCampus.id}`);
          const insts: Institute[] = instRes.data.data;
          setInstitutes(insts);

          if (insts.length > 0) {
            const currentInst = activeInstitute && insts.some((i) => i.id === activeInstitute.id)
              ? insts.find((i) => i.id === activeInstitute.id)!
              : insts[0];
            setActiveInstituteState(currentInst);
            setTenantHeaders(currentOrg.id, currentCampus.id, currentInst.id);
          } else {
            setActiveInstituteState(null);
            setTenantHeaders(currentOrg.id, currentCampus.id, '');
          }
        } else {
          setActiveCampusState(null);
          setActiveInstituteState(null);
          setInstitutes([]);
        }
      }
    } catch (err) {
      console.error('Error initializing tenant context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const setActiveOrg = (org: Organization) => {
    setActiveOrgState(org);
    if (activeCampus && activeInstitute) {
      setTenantHeaders(org.id, activeCampus.id, activeInstitute.id);
    }
  };

  const setActiveCampus = async (campus: Campus) => {
    setActiveCampusState(campus);
    try {
      // Fetch institutes specifically belonging to the selected campus
      const instRes = await api.get(`/institutes?campusId=${campus.id}`);
      const insts: Institute[] = instRes.data.data;
      setInstitutes(insts);

      const firstInst = insts.length > 0 ? insts[0] : null;
      setActiveInstituteState(firstInst);

      if (activeOrg) {
        setTenantHeaders(activeOrg.id, campus.id, firstInst ? firstInst.id : '');
      }
    } catch (err) {
      console.error('Error fetching institutes for campus:', err);
    }
  };

  const setActiveInstitute = (inst: Institute) => {
    setActiveInstituteState(inst);
    if (activeOrg && activeCampus) {
      setTenantHeaders(activeOrg.id, activeCampus.id, inst.id);
    }
  };

  const addCampus = async (data: { name: string; code: string; address?: string; city?: string; state?: string; pincode?: string }) => {
    const res = await api.post('/campuses', data);
    const newCampus: Campus = res.data.data;
    setCampuses((prev) => [...prev, newCampus]);
    if (!activeCampus) {
      await setActiveCampus(newCampus);
    }
  };

  const updateCampus = async (id: string, data: Partial<Campus>) => {
    await api.put(`/campuses/${id}`, data);
    await loadTenants();
  };

  const deleteCampus = async (id: string) => {
    await api.delete(`/campuses/${id}`);
    await loadTenants();
  };

  const addInstitute = async (data: { campus_id: string; name: string; code: string; type: string; address?: string }) => {
    const res = await api.post('/institutes', data);
    const newInstitute: Institute = res.data.data;

    // If added to currently active campus, update active institutes dropdown
    if (activeCampus && newInstitute.campus_id === activeCampus.id) {
      setInstitutes((prev) => [...prev, newInstitute]);
      if (!activeInstitute) {
        setActiveInstitute(newInstitute);
      }
    }
  };

  const updateInstitute = async (id: string, data: Partial<Institute>) => {
    await api.put(`/institutes/${id}`, data);
    await loadTenants();
  };

  const deleteInstitute = async (id: string) => {
    await api.delete(`/institutes/${id}`);
    await loadTenants();
  };

  return (
    <TenantContext.Provider
      value={{
        organizations,
        campuses,
        institutes,
        activeOrg,
        activeCampus,
        activeInstitute,
        setActiveOrg,
        setActiveCampus,
        setActiveInstitute,
        addCampus,
        updateCampus,
        deleteCampus,
        addInstitute,
        updateInstitute,
        deleteInstitute,
        refreshTenants: loadTenants,
        isLoading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

