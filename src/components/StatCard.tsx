import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'info';
  sub?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-white border-slate-200',
  warning: 'bg-amber-50 border-amber-200',
  success: 'bg-emerald-50 border-emerald-200',
  info: 'bg-sky-50 border-sky-200',
};

const iconVariant: Record<string, string> = {
  default: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-sky-100 text-sky-600',
};

const valueVariant: Record<string, string> = {
  default: 'text-slate-800',
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  info: 'text-sky-700',
};

export default function StatCard({ label, value, icon, variant = 'default', sub }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${variantClasses[variant]}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconVariant[variant]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium truncate">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${valueVariant[variant]}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
