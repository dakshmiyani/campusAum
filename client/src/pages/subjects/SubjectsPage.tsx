import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Subject } from '../../types';
import { BookOpenCheck, Plus, UserCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data.data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Subject Allocation Matrix</h1>
          <p className="text-xs text-[#6F6A60]">
            Mapping academic subjects to teaching faculty for timetable preparation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subjects.map((sub) => (
          <div key={sub.id} className="custom-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
              <span className="font-mono font-bold text-xs text-[#722B2B] bg-[#722B2B]/10 px-2.5 py-0.5 rounded-md">
                {sub.code}
              </span>
              <Badge variant="navy">Sem {sub.semester} | {sub.credits} Credits</Badge>
            </div>
            <h3 className="text-base font-serif font-bold text-[#17243A]">{sub.name}</h3>

            <div className="pt-2 border-t border-[#D8C28A] space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold text-[#6F6A60] flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-[#C9A85C]" />
                <span>Assigned Faculty Member(s)</span>
              </div>
              {sub.allocations && sub.allocations.length > 0 ? (
                sub.allocations.map((alloc: any) => (
                  <div key={alloc.id} className="p-2 bg-[#F8F4EC] rounded-md flex justify-between items-center">
                    <span className="font-bold text-[#17243A]">
                      {alloc.first_name} {alloc.last_name} ({alloc.employee_code})
                    </span>
                    <span className="text-[10px] text-[#6F6A60]">Sec {alloc.section} • {alloc.academic_year}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-[#6F6A60] italic">No faculty allocated yet.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
