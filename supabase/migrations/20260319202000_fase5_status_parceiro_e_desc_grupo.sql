-- ==============================================================================
-- FASE 5: STATUS DO PARCEIRO E DESCRIÇÃO DO GRUPO
-- ==============================================================================

-- ==============================================================================
-- 1. STATUS DO PARCEIRO EM profiles
-- Controla o ciclo de vida do parceiro: pendente -> ativo | bloqueado
-- ==============================================================================
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';

-- Atualiza parceiros existentes que não possuem status definido
UPDATE public.profiles
SET status = 'ativo'
WHERE status IS NULL;

-- Constraint de validação para valores permitidos
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS chk_profiles_status;

ALTER TABLE public.profiles
    ADD CONSTRAINT chk_profiles_status
    CHECK (status IN ('pendente', 'ativo', 'bloqueado'));

-- Índice para facilitar filtros por status no painel admin
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ==============================================================================
-- 2. DESCRIÇÃO DO GRUPO EM grupos_parceiros
-- Campo de texto livre para o admin descrever o grupo aos parceiros.
-- ==============================================================================
ALTER TABLE public.grupos_parceiros
    ADD COLUMN IF NOT EXISTS descricao TEXT;

-- ==============================================================================
-- 3. FUNÇÃO AUXILIAR: Buscar parceiro por slug (sem RLS — usada em /ref/[slug])
-- Retorna dados básicos do parceiro (sem dados sensíveis) para exibição pública.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_get_partner_by_slug(p_slug TEXT)
RETURNS TABLE (
    id         UUID,
    tenant_id  UUID,
    nome       TEXT,
    slug       TEXT,
    grupo_id   UUID,
    status     TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        p.id,
        p.tenant_id,
        p.nome,
        p.slug,
        p.grupo_id,
        p.status
    FROM public.profiles p
    WHERE p.slug = p_slug
      AND p.tipo_usuario = 'parceiro'
      AND p.status = 'ativo'
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_partner_by_slug TO anon, authenticated, service_role;

-- ==============================================================================
-- 4. ATUALIZAÇÃO DE fn_get_grupo_by_slug PARA INCLUIR CAMPO DESCRICAO
-- Necessário para exibir as regras do grupo na landing page de captação.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_get_grupo_by_slug(p_slug TEXT)
RETURNS TABLE (
    id               UUID,
    tenant_id        UUID,
    nome             TEXT,
    slug             TEXT,
    link_captacao    TEXT,
    tipo_remuneracao TEXT,
    valor_recompensa NUMERIC,
    descricao        TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        gp.id,
        gp.tenant_id,
        gp.nome,
        gp.slug,
        gp.link_captacao,
        gp.tipo_remuneracao::TEXT,
        gp.valor_recompensa,
        gp.descricao
    FROM public.grupos_parceiros gp
    WHERE gp.slug = p_slug
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_grupo_by_slug TO anon, authenticated, service_role;
