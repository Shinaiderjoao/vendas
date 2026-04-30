import { useState, useEffect } from 'react';
import { X, Plus, Clock, Mail, User, DollarSign, Tag, Calendar, AlignLeft, Trash2 } from 'lucide-react';
import type { Opportunity, Activity, Stage } from '../types';
import { STAGES } from '../types';
import { fetchActivities, addActivity, updateOpportunity, deleteOpportunity, moveStage } from '../lib/api';

interface Props {
  opportunity: Opportunity;
  onClose: () => void;
  onUpdate: (op: Opportunity) => void;
  onDelete: (id: string) => void;
}

const activityTypes = ['Reunião', 'Ligação', 'E-mail', 'Proposta', 'Visita', 'Outro'];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OpportunityModal({ opportunity, onClose, onUpdate, onDelete }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [tab, setTab] = useState<'details' | 'activity'>('details');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    client_name: opportunity.client_name,
    email: opportunity.email,
    title: opportunity.title,
    amount: String(opportunity.amount),
    stage: opportunity.stage as Stage,
    next_action: opportunity.next_action ?? '',
    sla_date: opportunity.sla_date ? opportunity.sla_date.slice(0, 10) : '',
  });

  const [actForm, setActForm] = useState({ activity_type: 'Reunião', notes: '', date: new Date().toISOString().slice(0, 16) });
  const [addingActivity, setAddingActivity] = useState(false);

  useEffect(() => {
    fetchActivities(opportunity.id).then(setActivities).finally(() => setLoadingActivities(false));
  }, [opportunity.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateOpportunity(opportunity.id, {
        client_name: form.client_name,
        email: form.email,
        title: form.title,
        amount: parseFloat(form.amount) || 0,
        stage: form.stage,
        next_action: form.next_action || null,
        sla_date: form.sla_date ? new Date(form.sla_date).toISOString() : null,
      });
      onUpdate(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddActivity() {
    setAddingActivity(true);
    try {
      const act = await addActivity(opportunity.id, {
        activity_type: actForm.activity_type,
        notes: actForm.notes,
        date: new Date(actForm.date).toISOString(),
      });
      setActivities(prev => [act, ...prev]);
      setActForm({ activity_type: 'Reunião', notes: '', date: new Date().toISOString().slice(0, 16) });
    } finally {
      setAddingActivity(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta oportunidade?')) return;
    setDeleting(true);
    try {
      await deleteOpportunity(opportunity.id);
      onDelete(opportunity.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg font-bold text-slate-800 truncate">{opportunity.client_name}</h2>
            <p className="text-sm text-slate-500 truncate mt-0.5">{opportunity.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {(['details', 'activity'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'details' ? 'Detalhes' : 'Atividades'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    <User className="w-3 h-3 inline mr-1" />Cliente
                  </label>
                  <input
                    value={form.client_name}
                    onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    <Mail className="w-3 h-3 inline mr-1" />E-mail
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  <Tag className="w-3 h-3 inline mr-1" />Oportunidade
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    <DollarSign className="w-3 h-3 inline mr-1" />Valor estimado
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Etapa</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm(f => ({ ...f, stage: e.target.value as Stage }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    <AlignLeft className="w-3 h-3 inline mr-1" />Próxima ação
                  </label>
                  <input
                    value={form.next_action}
                    onChange={e => setForm(f => ({ ...f, next_action: e.target.value }))}
                    placeholder="Ex: Ligar, enviar proposta..."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />Data limite
                  </label>
                  <input
                    type="date"
                    value={form.sla_date}
                    onChange={e => setForm(f => ({ ...f, sla_date: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
                <span>Criado: {formatDateTime(opportunity.created_at)}</span>
                <span>·</span>
                <span>Última interação: {formatDateTime(opportunity.last_interaction)}</span>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-600">Registrar atividade</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
                    <select
                      value={actForm.activity_type}
                      onChange={e => setActForm(f => ({ ...f, activity_type: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Data/hora</label>
                    <input
                      type="datetime-local"
                      value={actForm.date}
                      onChange={e => setActForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Notas</label>
                  <textarea
                    value={actForm.notes}
                    onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Descreva o que aconteceu..."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddActivity}
                  disabled={addingActivity}
                  className="flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {addingActivity ? 'Salvando...' : 'Adicionar atividade'}
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Histórico</p>
                {loadingActivities ? (
                  <p className="text-sm text-slate-400">Carregando...</p>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhuma atividade registrada.</p>
                ) : activities.map(act => (
                  <div key={act.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-700">{act.activity_type}</span>
                        <span className="text-xs text-slate-400">{formatDateTime(act.date)}</span>
                      </div>
                      {act.notes && <p className="text-sm text-slate-600 mt-0.5">{act.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
