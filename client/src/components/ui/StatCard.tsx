import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'gold' | 'navy' | 'burgundy';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'gold',
}) => {
  return (
    <div className="bg-[#EFE8DA] border border-[#D8C28A] rounded-xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#6F6A60] uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-[#17243A] mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-[11px] text-[#6F6A60] mt-1">{subtitle}</p>}
          {trend && <p className="text-[11px] font-semibold text-emerald-700 mt-1">{trend}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            color === 'navy'
              ? 'bg-[#17243A] text-[#C9A85C]'
              : color === 'burgundy'
              ? 'bg-[#722B2B] text-white'
              : 'bg-[#C9A85C]/20 text-[#17243A]'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C9A85C]/40"></div>
    </div>
  );
};
