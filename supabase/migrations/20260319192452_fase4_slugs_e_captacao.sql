-- ==============================================================================
-- FASE 4: SISTEMA DE SLUGS, LINKS DE CAPTAÇÃO E CORREÇÕES DE SALDO
-- ==============================================================================

-- ==============================================================================
-- 1. FUNÇÃO DE GERAÇÃO DE SLUG
-- Converte texto para slug amigável e garante unicidade com fallback numérico.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_generate_slug(p_texto TEXT, p_tabela TEXT DEFAULT 'profiles')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INTEGER := 0;
  v_exists BOOLEAN;
BEGIN
  -- 1. Normaliza: converte acentos, lowercase, substitui espaços por underscore, remove especiais
  v_base_slug := lower(
    regexp_replace(
      translate(
        p_texto,
        'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ',
        'aaaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiioooooouuuucn'
      ),
      '[^a-z0-9\s_]', '', 'g'
    )
  );
  v_base_slug := regexp_replace(trim(v_base_slug), '\s+', '_', 'g');
  v_final_slug := v_base_slug;

  -- 2. Verifica unicidade na tabela correta com loop de fallback
  IF p_tabela = 'profiles' THEN
    LOOP
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE slug = v_final_slug) INTO v_exists;
      EXIT WHEN NOT v_exists;
      v_counter := v_counter + 1;
      v_final_slug := v_base_slug || '_' || v_counter;
    END LOOP;
  ELSIF p_tabela = 'grupos_parceiros' THEN
    LOOP
      SELECT EXISTS(SELECT 1 FROM public.grupos_parceiros WHERE slug = v_final_slug) INTO v_exists;
      EXIT WHEN NOT v_exists;
      v_counter := v_counter + 1;
      v_final_slug := v_base_slug || '_' || v_counter;
    END LOOP;
  END IF;

  RETURN v_final_slug;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_generate_slug FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_generate_slug TO service_role;

-- ==============================================================================
-- 2. COLUNA slug EM profiles
-- Gerado automaticamente via trigger a partir do nome do parceiro.
-- ==============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug) WHERE slug IS NOT NULL;

-- Popula slugs para profiles existentes que não possuem
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, nome FROM public.profiles WHERE slug IS NULL AND nome IS NOT NULL LOOP
    UPDATE public.profiles
    SET slug = public.fn_generate_slug(r.nome, 'profiles')
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- Trigger de auto-geração de slug ao criar novo profile
CREATE OR REPLACE FUNCTION public.fn_auto_slug_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL AND NEW.nome IS NOT NULL THEN
    NEW.slug := public.fn_generate_slug(NEW.nome, 'profiles');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_slug_profile ON public.profiles;
CREATE TRIGGER trg_auto_slug_profile
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_slug_profile();

-- ==============================================================================
-- 3. COLUNAS slug E link_captacao EM grupos_parceiros
-- O admin cria o grupo; o banco gera o slug e o link exclusivo automaticamente.
-- ==============================================================================
ALTER TABLE public.grupos_parceiros ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.grupos_parceiros ADD COLUMN IF NOT EXISTS link_captacao TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_grupos_slug ON public.grupos_parceiros(slug) WHERE slug IS NOT NULL;

-- Popula slugs para grupos existentes sem slug
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, nome FROM public.grupos_parceiros WHERE slug IS NULL AND nome IS NOT NULL LOOP
    UPDATE public.grupos_parceiros
    SET slug = public.fn_generate_slug(r.nome, 'grupos_parceiros')
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- Trigger: gera slug e link_captacao automaticamente ao inserir grupo
CREATE OR REPLACE FUNCTION public.fn_auto_slug_grupo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL AND NEW.nome IS NOT NULL THEN
    NEW.slug := public.fn_generate_slug(NEW.nome, 'grupos_parceiros');
  END IF;
  -- Link interno (sem domínio) — o front-end monta a URL completa
  IF NEW.link_captacao IS NULL AND NEW.slug IS NOT NULL THEN
    NEW.link_captacao := '/grupo/' || NEW.slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_slug_grupo ON public.grupos_parceiros;
CREATE TRIGGER trg_auto_slug_grupo
  BEFORE INSERT ON public.grupos_parceiros
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_slug_grupo();

-- Atualiza link_captacao para grupos existentes que não possuem
UPDATE public.grupos_parceiros
SET link_captacao = '/grupo/' || slug
WHERE link_captacao IS NULL AND slug IS NOT NULL;

-- ==============================================================================
-- 4. GARANTIA DE saldo_pontos EM profiles
-- Garante que a coluna exista, seja numérica e tenha valor padrão 0.
-- ==============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saldo_pontos NUMERIC DEFAULT 0;
UPDATE public.profiles SET saldo_pontos = 0 WHERE saldo_pontos IS NULL;

-- ==============================================================================
-- 5. ATUALIZAÇÃO DO CONSTRAINT DE STATUS EM leads
-- Adiciona 'PAGO' como status válido para leads (após pagamento ser confirmado).
-- ==============================================================================
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS chk_leads_status;
-- Sem adicionar novamente — a coluna status é TEXT sem constraint original.
-- Verificamos apenas se existe algum constraint restritivo para não bloquear INSERTs futuros.
-- (Status de leads controlado por lógica de aplicação via validação no service)

-- ==============================================================================
-- 6. FUNÇÃO AUXILIAR: Buscar grupo por slug (sem RLS — usada nas páginas públicas)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_get_grupo_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  nome TEXT,
  slug TEXT,
  link_captacao TEXT,
  tipo_remuneracao TEXT,
  valor_recompensa NUMERIC
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
    gp.valor_recompensa
  FROM public.grupos_parceiros gp
  WHERE gp.slug = p_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.fn_get_grupo_by_slug TO anon, authenticated, service_role;
