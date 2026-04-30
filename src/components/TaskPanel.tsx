import { AlertCircle, Calendar, Clock } from 'lucide-react';
import type { Opportunity } from '../types';

interface TaskEntry {
  opportunity: Opportunity;
}

interface Props {
  opportunities: Opportunity[];
  onCardClick: (op: Opportunity) => void;
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function buildSections(opportunities: Opportunity[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdue: Opportunity[] = [];
  const todayTasks: Opportunity[] = [];
  const next: Opportunity[] = [];

  for (const op of opportunities) {
    if (op.stage === 'Fechado - ganho' || op.stage === 'Fechado - perdido') continue;
    if (!op.sla_date || !op.next_action) continue;
    const due = new Date(op.sla_date);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    if (dueDay < today) overdue.push(op);
    else if (dueDay.getTime() === today.getTime()) todayTasks.push(op);
    else next.push(op);
  }
  return { overdue, todayTasks, next };
}

function TaskItem({ op, onCardClick }: { op: Opportunity; onCardClick: (op: Opportunity) => void }) {
  return (
    <button
      onClick={() => onCardClick(op)}
      className="w-full text-left flex gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0 group-hover:bg-blue-400 transition-colors" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{op.client_name}</p>
        <p className="text-xs text-slate-500 truncate">{op.next_action}</p>
        {op.sla_date && (
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(op.sla_date)}</p>
        )}
      </div>
    </button>
  );
}

export default function TaskPanel({ opportunities, onCardClick }: Props) {
  const { overdue, todayTasks, next } = buildSections(opportunities);

  return (
    <div className="flex flex-col gap-5">
      {overdue.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide">Atrasadas ({overdue.length})</h4>
          </div>
          <div className="space-y-1">
            {overdue.map(op => <TaskItem key={op.id} op={op} onCardClick={onCardClick} />)}
          </div>
        </section>
      )}

      {todayTasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">Hoje ({todayTasks.length})</h4>
          </div>
          <div className="space-y-1">
            {todayTasks.map(op => <TaskItem key={op.id} op={op} onCardClick={onCardClick} />)}
          </div>
        </section>
      )}

      {next.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Próximas ({next.length})</h4>
          </div>
          <div className="space-y-1">
            {next.map(op => <TaskItem key={op.id} op={op} onCardClick={onCardClick} />)}
          </div>
        </section>
      )}

      {overdue.length === 0 && todayTasks.length === 0 && next.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">Nenhuma tarefa pendente</p>
      )}
    </div>
  );
}
