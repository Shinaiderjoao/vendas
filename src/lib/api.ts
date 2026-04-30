import { supabase } from './supabase';
import type { Opportunity, Activity, DashboardStats, Stage } from '../types';

export async function fetchOpportunities(stage?: string, search?: string): Promise<Opportunity[]> {
  let query = supabase.from('opportunities').select('*').order('created_at', { ascending: false });
  if (stage) query = query.eq('stage', stage);
  if (search) {
    query = query.or(`client_name.ilike.%${search}%,title.ilike.%${search}%,email.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as Opportunity[]) ?? [];
}

export async function createOpportunity(payload: Omit<Opportunity, 'id' | 'created_at'>): Promise<Opportunity> {
  const { data, error } = await supabase.from('opportunities').insert(payload).select().single();
  if (error) throw error;
  return data as Opportunity;
}

export async function updateOpportunity(id: string, payload: Partial<Opportunity>): Promise<Opportunity> {
  const { data, error } = await supabase.from('opportunities').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Opportunity;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const { error } = await supabase.from('opportunities').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchActivities(opportunityId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as Activity[]) ?? [];
}

export async function addActivity(opportunityId: string, payload: { date: string; activity_type: string; notes: string }): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert({ ...payload, opportunity_id: opportunityId })
    .select()
    .single();
  if (error) throw error;
  await supabase.from('opportunities').update({ last_interaction: payload.date }).eq('id', opportunityId);
  return data as Activity;
}

export async function computeDashboard(opportunities: Opportunity[]): Promise<DashboardStats> {
  const now = new Date();
  const total = opportunities.length;
  const won = opportunities.filter(o => o.stage === 'Fechado - ganho').length;
  const lost = opportunities.filter(o => o.stage === 'Fechado - perdido').length;
  const overdue = opportunities.filter(o =>
    o.sla_date &&
    new Date(o.sla_date) < now &&
    o.stage !== 'Fechado - ganho' &&
    o.stage !== 'Fechado - perdido'
  ).length;
  const noActivity = opportunities.filter(o => !o.last_interaction).length;
  const conversionRate = total ? Math.round((won / total) * 1000) / 10 : 0;
  const totalValue = opportunities
    .filter(o => o.stage !== 'Fechado - perdido')
    .reduce((sum, o) => sum + (o.amount ?? 0), 0);
  return { total, overdue, noActivity, conversionRate, won, lost, totalValue };
}

export async function moveStage(id: string, stage: Stage): Promise<Opportunity> {
  return updateOpportunity(id, { stage });
}
