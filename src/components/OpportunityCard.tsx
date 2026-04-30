import { Calendar, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import type { Opportunity } from '../types';

interface Props {
  opportunity: Opportunity;
  onClick: () => void;
}

const stageColors: Record<string, string> = {
  'Novo lead': 'bg-slate-100 text-slate-600',
  'Contato realizado': 'bg-sky-100 text-sky-700',
  'Proposta enviada': 'bg-blue-100 text-blue-700',
  'Negociação': 'bg-amber-100 text-amber-700',
  'Fechado - ganho': 'bg-emerald-100 text-emerald-700',
  'Fechado - perdido': 'bg-red-100 text-red-600',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function isOverdue(sla: string | null) {
  if (!sla) return false;
  return new Date(sla) < new Date();
}

export default function OpportunityCard({ opportunity, onClick }: Props) {
  const overdue = isOverdue(opportunity.sla_date);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{opportunity.client_name}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{opportunity.title}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5 transition-colors" />
      </div>

      <p className="text-base font-bold text-slate-700 mb-3">{formatCurrency(opportunity.amount)}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {opportunity.sla_date && (
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${overdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            {overdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            {formatDate(opportunity.sla_date)}
          </span>
        )}
        {opportunity.next_action && (
          <span className="text-xs text-slate-400 truncate max-w-[140px]" title={opportunity.next_action}>
            {opportunity.next_action}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
        <Mail className="w-3 h-3 shrink-0" />
        <span className="truncate">{opportunity.email}</span>
      </div>
    </button>
  );
}
