-- ==============================================================================
-- HOTFIX: Estabiliza login por senha quando o custom_access_token_hook falha
-- Sintoma corrigido: "Database error querying schema"
-- ==============================================================================

-- Garante que o role interno do Auth consiga resolver objetos do schema public.
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- Garante permissao explicita para leitura minima usada no hook.
GRANT SELECT (id, tenant_id, tipo_usuario) ON TABLE public.profiles TO supabase_auth_admin;

-- Hook robusto: nao quebra login se profile ainda nao existir ou se houver qualquer
-- erro de consulta em public.profiles.
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  claims jsonb := COALESCE(event->'claims', '{}'::jsonb);
  user_id uuid;
  profile_tenant_id uuid;
  profile_role text;
BEGIN
  BEGIN
    user_id := NULLIF(event->>'user_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    -- Se o payload vier sem user_id valido, devolve sem bloquear autenticacao.
    RETURN event;
  END;

  IF user_id IS NULL THEN
    RETURN event;
  END IF;

  BEGIN
    SELECT p.tenant_id, p.tipo_usuario
      INTO profile_tenant_id, profile_role
    FROM public.profiles p
    WHERE p.id = user_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    -- Qualquer erro de schema/permissao no profile nao deve impedir login.
    RETURN event;
  END;

  IF profile_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(profile_tenant_id), true);
  END IF;

  IF profile_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{tipo_usuario}', to_jsonb(profile_role), true);
  END IF;

  event := jsonb_set(event, '{claims}', claims, true);
  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;
