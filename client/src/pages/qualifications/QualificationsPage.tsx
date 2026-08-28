import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { QualificationMaster } from '../../types';
import { GraduationCap, Plus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const QualificationsPage: React.FC = () => {
  const [qualifications, setQualifications] = useState<QualificationMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQualifications() {
      try {
        const res = await api.get('/qualifications');
        setQualifications(res.data.data);
      } catch (err) {
        console.error('Error fetching qualifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQualifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Academic Qualifications Registry</h1>
          <p className="text-xs text-[#6F6A60]">
            Master catalog of recognized degrees, doctorate programs, and certifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {qualifications.map((q) => (
          <div key={q.id} className="custom-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D8C28A] pb-2">
              <Badge variant="teaching">{q.level}</Badge>
              <GraduationCap className="w-5 h-5 text-[#C9A85C]" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#17243A]">{q.name}</h3>
            <p className="text-xs text-[#6F6A60]">Specialization Domain: {q.specialization || 'General Academic'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
