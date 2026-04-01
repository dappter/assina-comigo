-- SCRIPT DE DIAGNOSTICO DE AUTENTICACAO (SEGURO)
-- NAO insira usuarios diretamente em auth.users.
-- Isso pode quebrar tabelas internas do Supabase Auth (ex: auth.identities)
-- e causar: "Database error querying schema" no signInWithPassword.

-- Para criar/corrigir o admin com seguranca, use o script API:
-- node create_admin_api.ts (ou converta para runtime TS do seu ambiente)
-- que usa supabase.auth.admin.createUser/updateUserById.

-- 1) Verifica consistencia do usuario no Auth e no Profile
WITH target_user AS (
  SELECT id, email
  FROM auth.users
  WHERE email = 'admin@topconexoes.com'
)
SELECT
  tu.id AS auth_user_id,
  tu.email,
  p.id AS profile_id,
  p.tenant_id,
  p.tipo_usuario,
  p.status,
  EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = tu.id
  ) AS has_identity
FROM target_user tu
LEFT JOIN public.profiles p ON p.id = tu.id;

-- 2) Lista usuarios do auth sem identity (estado inconsistente)
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE i.user_id IS NULL
ORDER BY u.created_at DESC;

-- 3) Lista profiles admin sem correspondente em auth.users
SELECT
  p.id,
  p.email,
  p.tenant_id,
  p.tipo_usuario
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.tipo_usuario = 'admin'
  AND u.id IS NULL;
