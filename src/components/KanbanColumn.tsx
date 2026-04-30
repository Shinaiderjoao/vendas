import type { Opportunity, Stage } from '../types';
import OpportunityCard from './OpportunityCard';

interface Props {
  stage: Stage;
  opportunities: Opportunity[];
  onCardClick: (op: Opportunity) => void;
  colorClass: string;
  dotClass: string;
}

export default function KanbanColumn({ stage, opportunities, onCardClick, colorClass, dotClass }: Props) {
  const total = opportunities.reduce((s, o) => s + (o.amount ?? 0), 0);
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(total);

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      <div className={`flex items-center gap-2 mb-3 px-1`}>
        <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        <h3 className="font-semibold text-slate-700 text-sm flex-1 truncate">{stage}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>{opportunities.length}</span>
      </div>
      {opportunities.length > 0 && (
        <p className="text-xs text-slate-400 mb-3 px-1">{formatted}</p>
      )}
      <div className="flex flex-col gap-3 flex-1">
        {opportunities.map(op => (
          <OpportunityCard key={op.id} opportunity={op} onClick={() => onCardClick(op)} />
        ))}
        {opportunities.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            Sem oportunidades
          </div>
        )}
      </div>
    </div>
  );
}
