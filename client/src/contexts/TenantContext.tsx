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

  useEffect(() => {
    async function loadTenants() {
      try {
        const orgRes = await api.get('/organizations');
        const orgs = orgRes.data.data;
        setOrganizations(orgs);

        if (orgs.length > 0) {
          const currentOrg = orgs[0];
          setActiveOrgState(currentOrg);

          const campusRes = await api.get(`/campuses?organization_id=${currentOrg.id}`);
          const camps = campusRes.data.data;
          setCampuses(camps);

          if (camps.length > 0) {
            const currentCampus = camps[0];
            setActiveCampusState(currentCampus);

            const instRes = await api.get(`/institutes?campusId=${currentCampus.id}`);
            const insts = instRes.data.data;
            setInstitutes(insts);

            if (insts.length > 0) {
              const currentInst = insts[0];
              setActiveInstituteState(currentInst);
              setTenantHeaders(currentOrg.id, currentCampus.id, currentInst.id);
            }
          }
        }
      } catch (err) {
        console.error('Error initializing tenant context:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenants();
  }, []);

  const setActiveOrg = (org: Organization) => {
    setActiveOrgState(org);
    if (activeCampus && activeInstitute) {
      setTenantHeaders(org.id, activeCampus.id, activeInstitute.id);
    }
  };

  const setActiveCampus = (campus: Campus) => {
    setActiveCampusState(campus);
    if (activeOrg && activeInstitute) {
      setTenantHeaders(activeOrg.id, campus.id, activeInstitute.id);
    }
  };

  const setActiveInstitute = (inst: Institute) => {
    setActiveInstituteState(inst);
    if (activeOrg && activeCampus) {
      setTenantHeaders(activeOrg.id, activeCampus.id, inst.id);
    }
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
