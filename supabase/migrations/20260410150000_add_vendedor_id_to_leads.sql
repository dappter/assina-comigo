-- Migration: Adiciona coluna vendedor_id na tabela leads
-- Data: 2026-04-10
-- Contexto: Permite atribuição de vendedores responsáveis por leads no painel admin.
-- A coluna é nullable (um lead pode não ter vendedor atribuído).

ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Índice para facilitar buscas/filtros por vendedor
CREATE INDEX IF NOT EXISTS leads_vendedor_id_idx ON public.leads(vendedor_id);

-- Documentação da coluna
COMMENT ON COLUMN public.leads.vendedor_id IS 'Vendedor responsável por acompanhar este lead. Referencia profiles.id.';
