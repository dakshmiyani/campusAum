import React from 'react';

interface BadgeProps {
  variant?: 'active' | 'inactive' | 'teaching' | 'non-teaching' | 'gold' | 'burgundy' | 'navy';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'gold', children, className = '' }) => {
  let styles = 'bg-[#C9A85C]/20 text-[#17243A] border-[#C9A85C]/40';

  if (variant === 'active') {
    styles = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (variant === 'inactive') {
    styles = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (variant === 'teaching') {
    styles = 'bg-[#17243A] text-[#C9A85C] border-[#17243A]';
  } else if (variant === 'non-teaching') {
    styles = 'bg-[#EFE8DA] text-[#6F6A60] border-[#D8C28A]';
  } else if (variant === 'burgundy') {
    styles = 'bg-[#722B2B] text-white border-[#722B2B]';
  } else if (variant === 'navy') {
    styles = 'bg-[#17243A] text-white border-[#17243A]';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles} ${className}`}
    >
      {children}
    </span>
  );
};
