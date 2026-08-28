import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart3, Download, FileSpreadsheet, PieChart, Users, DollarSign } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';

export const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/reports/summary');
        setReportData(res.data.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportSummaryJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `CampusAUM_Institutional_Report_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#D8C28A] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#17243A]">Institutional Reports & Analytics</h1>
          <p className="text-xs text-[#6F6A60]">
            Executive analytics, departmental distribution, qualification matrix & payroll audit
          </p>
        </div>

        <button
          onClick={exportSummaryJSON}
          className="inline-flex items-center space-x-2 bg-[#17243A] text-[#C9A85C] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#243552] transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Complete Analytics JSON</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#6F6A60]">Loading analytical report...</div>
      ) : (
        <div className="space-y-6">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Active Faculty & Staff"
              value={reportData?.totalStaff || 0}
              subtitle="Verified Institutional Records"
              icon={Users}
              color="navy"
            />
            <StatCard
              title="Teaching vs Non-Teaching"
              value={`${reportData?.teachingCount} / ${reportData?.nonTeachingCount}`}
              subtitle="Faculty Ratio (75% / 25%)"
              icon={PieChart}
              color="gold"
            />
            <StatCard
              title="Total Gross Monthly Payroll"
              value={`₹${(reportData?.payroll?.totalGross || 0).toLocaleString()}`}
              subtitle={`Net Disbursement: ₹${(reportData?.payroll?.totalNet || 0).toLocaleString()}`}
              icon={DollarSign}
              color="burgundy"
            />
          </div>

          {/* Detailed Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Headcount Report */}
            <div className="custom-card p-5 space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2 flex items-center justify-between">
                <span>Department Headcount Report</span>
                <BarChart3 className="w-4 h-4 text-[#C9A85C]" />
              </h3>

              <div className="space-y-3 text-xs">
                {reportData?.departmentBreakdown?.map((d: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-[#F8F4EC] rounded-lg border border-[#D8C28A]/50">
                    <span className="font-bold text-[#17243A]">{d.department_name}</span>
                    <span className="font-mono font-bold text-[#722B2B]">{d.staff_count} Members</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Designation Cadre Report */}
            <div className="custom-card p-5 space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#17243A] border-b border-[#D8C28A] pb-2 flex items-center justify-between">
                <span>Designation Seniority Distribution</span>
                <PieChart className="w-4 h-4 text-[#C9A85C]" />
              </h3>

              <div className="space-y-3 text-xs">
                {reportData?.designationBreakdown?.map((des: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-[#F8F4EC] rounded-lg border border-[#D8C28A]/50">
                    <span className="font-bold text-[#17243A]">{des.designation_name}</span>
                    <span className="font-mono font-bold text-[#17243A]">{des.staff_count} Faculty</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
