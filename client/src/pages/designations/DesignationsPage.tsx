import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Designation } from '../../types';
import { Award, Plus, Layers } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const DesignationsPage: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDesignations() {
      try {
        const res = await api.get('/designations');
        setDesignations(res.data.data);
      } catch (err) {
        console.error('Error fetching designations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDesignations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Designations & Rank Hierarchy</h1>
          <p className="text-xs text-[#6F6A60]">
            Institutional designations, cadre seniority level, and staff mapping
          </p>
        </div>
      </div>

      <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6F6A60]">Loading designations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#17243A] text-[#C9A85C] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Designation Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Seniority Level</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Staff Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C28A]/50 bg-[#F8F4EC]">
                {designations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-[#EFE8DA]/80">
                    <td className="py-3.5 px-4 font-bold text-[#17243A] flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#C9A85C]" />
                      <span>{desig.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#722B2B]">{desig.code}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="navy">Cadre Level {desig.level}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6A60]">{desig.description || 'Institutional Cadre'}</td>
                    <td className="py-3.5 px-4 font-bold text-[#17243A]">{desig.staff_count || 0} Staff</td>
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
