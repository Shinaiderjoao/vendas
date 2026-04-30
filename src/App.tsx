import { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Plus,
  Search,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
} from 'lucide-react';
import type { Opportunity, Stage, DashboardStats } from './types';
import { STAGES } from './types';
import { fetchOpportunities, computeDashboard } from './lib/api';
import StatCard from './components/StatCard';
import KanbanColumn from './components/KanbanColumn';
import OpportunityModal from './components/OpportunityModal';
import NewOpportunityModal from './components/NewOpportunityModal';
import TaskPanel from './components/TaskPanel';

const stageConfig: Record<Stage, { dot: string; badge: string }> = {
  'Novo lead': { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  'Contato realizado': { dot: 'bg-sky-400', badge: 'bg-sky-100 text-sky-700' },
  'Proposta enviada': { dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
  'Negociação': { dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
  'Fechado - ganho': { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  'Fechado - perdido': { dot: 'bg-red-400', badge: 'bg-red-100 text-red-600' },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);
}

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | ''>('');
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchOpportunities();
      setOpportunities(data);
      const s = await computeDashboard(data);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = opportunities;
    if (stageFilter) list = list.filter(o => o.stage === stageFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.client_name.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [opportunities, search, stageFilter]);

  const grouped = useMemo(() => {
    const map: Record<Stage, Opportunity[]> = {} as Record<Stage, Opportunity[]>;
    STAGES.forEach(s => { map[s] = []; });
    filtered.forEach(o => { if (map[o.stage]) map[o.stage].push(o); });
    return map;
  }, [filtered]);

  function handleUpdate(updated: Opportunity) {
    const next = opportunities.map(o => o.id === updated.id ? updated : o);
    setOpportunities(next);
    computeDashboard(next).then(setStats);
  }

  function handleDelete(id: string) {
    const next = opportunities.filter(o => o.id !== id);
    setOpportunities(next);
    computeDashboard(next).then(setStats);
  }

  function handleCreated(op: Opportunity) {
    const next = [op, ...opportunities];
    setOpportunities(next);
    computeDashboard(next).then(setStats);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-none">CRM Visual</h1>
            <p className="text-xs text-slate-400 mt-0.5">Pipeline de vendas</p>
          </div>
        </div>

        <div className="flex-1 relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente, proposta ou e-mail..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value as Stage | '')}
            className="appearance-none text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
          >
            <option value="">Todas as etapas</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova oportunidade
          </button>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="px-6 pt-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total de oportunidades"
            value={stats.total}
            icon={<Users className="w-5 h-5" />}
            variant="default"
          />
          <StatCard
            label="Valor no pipeline"
            value={formatCurrency(stats.totalValue)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="info"
          />
          <StatCard
            label="Atrasadas"
            value={stats.overdue}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant={stats.overdue > 0 ? 'warning' : 'default'}
            sub={stats.overdue > 0 ? 'Acao necessaria' : 'Tudo em dia'}
          />
          <StatCard
            label="Taxa de conversao"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
            sub={`${stats.won} ganhas · ${stats.lost} perdidas`}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Kanban */}
        <div className="flex-1 overflow-x-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : (
            <div className="flex gap-4 min-w-max pb-2">
              {STAGES.map(stage => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  opportunities={grouped[stage]}
                  onCardClick={setSelected}
                  colorClass={stageConfig[stage].badge}
                  dotClass={stageConfig[stage].dot}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={`border-l border-slate-200 bg-white transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-72' : 'w-12'}`}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-full flex items-center gap-2 px-3 py-4 border-b border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Activity className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="text-xs font-semibold uppercase tracking-wide">Tarefas</span>}
          </button>
          {sidebarOpen && (
            <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 53px)' }}>
              <TaskPanel opportunities={opportunities} onCardClick={setSelected} />
            </div>
          )}
        </aside>
      </div>

      {/* Modals */}
      {selected && (
        <OpportunityModal
          opportunity={selected}
          onClose={() => setSelected(null)}
          onUpdate={updated => { handleUpdate(updated); setSelected(null); }}
          onDelete={handleDelete}
        />
      )}
      {showNew && (
        <NewOpportunityModal
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
