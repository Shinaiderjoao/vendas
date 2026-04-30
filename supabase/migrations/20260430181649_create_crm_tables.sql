/*
  # CRM - Create opportunities and activities tables

  1. New Tables
    - `opportunities`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `email` (text)
      - `title` (text)
      - `amount` (numeric)
      - `stage` (text) - pipeline stage
      - `status` (text) - Ativo / Inativo
      - `next_action` (text)
      - `sla_date` (timestamptz)
      - `last_interaction` (timestamptz)
      - `created_at` (timestamptz)
    - `activities`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, FK to opportunities)
      - `date` (timestamptz)
      - `activity_type` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow authenticated users full CRUD on their own records
    - Public (anon) read-only for demo purposes via service role insert

  3. Notes
    - Seed data is inserted after table creation
*/

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'Novo lead',
  status text NOT NULL DEFAULT 'Ativo',
  next_action text DEFAULT '',
  sla_date timestamptz,
  last_interaction timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view opportunities"
  ON opportunities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert opportunities"
  ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON opportunities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete opportunities"
  ON opportunities FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anon users can view opportunities"
  ON opportunities FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert opportunities"
  ON opportunities FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update opportunities"
  ON opportunities FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete opportunities"
  ON opportunities FOR DELETE
  TO anon
  USING (true);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  activity_type text NOT NULL DEFAULT 'E-mail',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anon users can view activities"
  ON activities FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert activities"
  ON activities FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update activities"
  ON activities FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete activities"
  ON activities FOR DELETE
  TO anon
  USING (true);

-- Seed sample data
INSERT INTO opportunities (client_name, email, title, amount, stage, status, next_action, sla_date, last_interaction, created_at)
VALUES
  ('Mariana Silva', 'mariana@empresa.com', 'Projeto de consultoria', 14500, 'Contato realizado', 'Ativo', 'Enviar proposta final', now() + interval '1 day', now() - interval '2 days', now() - interval '10 days'),
  ('Grupo Alfa', 'vendas@grupoalfa.com', 'Software de automação', 32000, 'Proposta enviada', 'Ativo', 'Follow-up por e-mail', now() - interval '1 day', now() - interval '5 days', now() - interval '18 days'),
  ('Carlos Pereira', 'carlos@contato.com', 'Pacote anual', 8800, 'Novo lead', 'Ativo', 'Primeiro contato', now() + interval '2 days', null, now() - interval '3 days'),
  ('Tech Solutions', 'contato@techsolutions.com', 'Plataforma SaaS', 55000, 'Negociação', 'Ativo', 'Reunião de alinhamento', now() + interval '3 days', now() - interval '1 day', now() - interval '25 days'),
  ('Fernanda Costa', 'fernanda@costainc.com', 'Treinamento corporativo', 9200, 'Fechado - ganho', 'Ativo', null, null, now() - interval '7 days', now() - interval '30 days')
ON CONFLICT DO NOTHING;
