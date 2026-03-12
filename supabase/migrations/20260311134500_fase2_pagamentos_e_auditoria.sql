-- ==============================================================================
-- FASE 2: PAGAMENTOS, AUDITORIA ROBUSTA E CONFIGURAÇÕES DO TENANT
-- ==============================================================================

-- ==============================================================================
-- 1. TIPOS ENUMERADOS E REGRAS RÍGIDAS (CONSTRAINTS PARA O TIME DEV NÃO ERRAR)
-- ==============================================================================
-- Criação de um Enum para o tipo de recompensa (garante que só existam esses dois valores)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_recompensa_enum') THEN
        CREATE TYPE public.tipo_recompensa_enum AS ENUM ('dinheiro', 'pontos');
    END IF;
END$$;

-- Criamos uma tabela consolidada de status permitidos (opcional), mas vamos aplicar CHECK Constraints nas tabelas para evitar Enum Lock, pois são mais flexíveis.

-- ==============================================================================
-- 2. ALTERAÇÕES NA TABELA grupos_parceiros (Regras Financeiras Mais Seguras)
-- ==============================================================================
-- Expandindo os grupos para comportar dinheiro, pontos, e o gatilho.
ALTER TABLE public.grupos_parceiros ADD COLUMN IF NOT EXISTS tipo_recompensa public.tipo_recompensa_enum DEFAULT 'dinheiro';
ALTER TABLE public.grupos_parceiros ADD COLUMN IF NOT EXISTS valor_recompensa numeric CHECK (valor_recompensa >= 0) DEFAULT 0;
ALTER TABLE public.grupos_parceiros ADD COLUMN IF NOT EXISTS dias_quarentena integer CHECK (dias_quarentena >= 0) DEFAULT 30;
ALTER TABLE public.grupos_parceiros ADD COLUMN IF NOT EXISTS gatilho text DEFAULT 'Instalado';

-- ==============================================================================
-- 3. TABELA tenant_settings (Configuração White-label)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_settings (
  tenant_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cor_primaria text DEFAULT '#FFB918',
  cor_secundaria text DEFAULT '#111827',
  logo_url text,
  nome_fantasia text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================================================================
-- 4. TABELA pagamentos (Agrupamento e Comprovantes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  parceiro_id uuid not null references public.profiles(id) on delete restrict,
  valor_total numeric not null check (valor_total > 0),
  forma_pagamento text,  -- Ex: PIX
  status text not null check (status in ('processando', 'pago', 'falhou', 'cancelado')) default 'processando',
  comprovante_url text,  -- URL do Bucket do Supabase
  data_pagamento timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================================================================
-- 5. AJUSTES DA TABELA comissoes PARA SUPORTAR O FOREIGN KEY DE PAGAMENTO
-- ==============================================================================
ALTER TABLE public.comissoes ADD COLUMN IF NOT EXISTS pagamento_id uuid references public.pagamentos(id) on delete set null;
-- Garantimos que o status da comissão só pode comportar os fluxos maduros
ALTER TABLE public.comissoes DROP CONSTRAINT IF EXISTS chk_comissao_status;
ALTER TABLE public.comissoes ADD CONSTRAINT chk_comissao_status CHECK (status in ('pendente', 'a_pagar', 'em_processamento', 'pago', 'cancelado', 'estornado'));


-- ==============================================================================
-- 6. TABELA DE AUDITORIA (Rastreabilidade Intransponível)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.auditoria_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid not null references public.leads(id) on delete cascade,
  status_anterior text,
  status_novo text not null,
  modificado_por uuid references auth.users(id) on delete set null,
  data_modificacao timestamp with time zone default now()
);

-- Indices para facilitar visualizacao
CREATE INDEX IF NOT EXISTS idx_auditoria_leads_lead_id ON public.auditoria_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_tenant_id ON public.pagamentos(tenant_id);


-- ==============================================================================
-- 7. TRIGGER PARA INSERÇÃO AUTOMÁTICA DE AUDITORIA DE STATUS
-- ==============================================================================
-- Como solicitado: a forma mais complexa e robusta para evitar confusão do dev.
-- O banco fará isso sozinho sempre que ocorrer um UPDATE na tabela leads.

CREATE OR REPLACE FUNCTION public.fn_audit_lead_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Roda ignorando o RLS se necessário, para garantir que o log nunca falhe
AS $$
BEGIN
  -- Se for um UPDATE e o campo status mudou
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.auditoria_leads (
      tenant_id,
      lead_id,
      status_anterior,
      status_novo,
      modificado_por
    ) VALUES (
      NEW.tenant_id,
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid() -- captura automaticamente o usuario que fez a alteracao
    );
  -- Se for uma criação nova de Lead
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.auditoria_leads (
      tenant_id,
      lead_id,
      status_anterior,
      status_novo,
      modificado_por
    ) VALUES (
      NEW.tenant_id,
      NEW.id,
      NULL,
      NEW.status,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplica o trigger na tabela leads
DROP TRIGGER IF EXISTS trg_audit_lead_status ON public.leads;
CREATE TRIGGER trg_audit_lead_status
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_audit_lead_status_change();


-- ==============================================================================
-- 8. POLÍTICAS DE SEGURANÇA (RLS) MULTI-TENANT PARA AS NOVAS TABELAS
-- ==============================================================================

-- Para tenant_settings
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Isolamento por tenant - settings (select)" ON public.tenant_settings FOR SELECT USING (true); -- Settings sao publicas para renderizar o login? Depende. Se sim, true ou validacao pelo host. Vamos focar no logado:
DROP POLICY IF EXISTS "Isolamento por tenant - settings (select)" ON public.tenant_settings;
CREATE POLICY "Isolamento por tenant - settings (all)" ON public.tenant_settings
FOR ALL TO authenticated
USING (tenant_id::text = auth.jwt()->>'tenant_id')
WITH CHECK (tenant_id::text = auth.jwt()->>'tenant_id');

-- Para pagamentos
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Isolamento por tenant - pagamentos" ON public.pagamentos
FOR ALL TO authenticated
USING (tenant_id::text = auth.jwt()->>'tenant_id')
WITH CHECK (tenant_id::text = auth.jwt()->>'tenant_id');

-- Para auditoria_leads (Somente leitura para usuários normais, inserção controlada pelo trigger que roda como definer)
ALTER TABLE public.auditoria_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Isolamento por tenant - auditoria" ON public.auditoria_leads
FOR SELECT TO authenticated
USING (tenant_id::text = auth.jwt()->>'tenant_id');
-- Bloqueamos a delecao e update pelo front de qualquer linha de auditoria (Protecao total)
CREATE POLICY "Bloqueio total de alteracao em auditoria" ON public.auditoria_leads
FOR UPDATE TO authenticated USING (false);
CREATE POLICY "Bloqueio total de delecao em auditoria" ON public.auditoria_leads
FOR DELETE TO authenticated USING (false);
