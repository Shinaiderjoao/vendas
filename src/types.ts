export const STAGES = [
  'Novo lead',
  'Contato realizado',
  'Proposta enviada',
  'Negociação',
  'Fechado - ganho',
  'Fechado - perdido',
] as const;

export type Stage = typeof STAGES[number];

export interface Opportunity {
  id: string;
  client_name: string;
  email: string;
  title: string;
  amount: number;
  stage: Stage;
  status: string;
  next_action: string | null;
  sla_date: string | null;
  last_interaction: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  opportunity_id: string;
  date: string;
  activity_type: string;
  notes: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  overdue: number;
  noActivity: number;
  conversionRate: number;
  won: number;
  lost: number;
  totalValue: number;
}
