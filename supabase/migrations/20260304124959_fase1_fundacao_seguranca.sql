-- ==============================================================================
-- FASE 1: FUNDAÇÃO & SEGURANÇA NO SUPABASE (MULTI-TENANT)
-- ==============================================================================

-- 1. Criar tabela profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null,
  nome text,
  email text,
  tipo_usuario text check (tipo_usuario in ('admin', 'parceiro')),
  created_at timestamp with time zone default now()
);

-- 2. Criar tabela grupos_parceiros
create table public.grupos_parceiros (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  nome text not null,
  created_at timestamp with time zone default now()
);

-- 3. Criar tabela leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  parceiro_id uuid references public.profiles(id),
  nome text not null,
  cpf text not null,
  telefone text,
  status text,
  created_at timestamp with time zone default now()
);

-- 4. Criar tabela comissoes
create table public.comissoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid references public.leads(id),
  parceiro_id uuid references public.profiles(id),
  valor numeric,
  status text,
  -- status da comissao segundo a SKILL: 'Quarentena', 'A Pagar', 'Cancelado', etc.
  release_date timestamp with time zone, -- adicionado para a regra de quarentena da SKILL
  created_at timestamp with time zone default now()
);

-- ==============================================================================
-- ÍNDICES E CONSTRAINTS (ANTI DUPLICIDADE)
-- ==============================================================================

-- Impedir CPF duplicado dentro do mesmo tenant (Regra da SKILL e Prompt)
alter table public.leads
add constraint idx_unique_lead_por_tenant
unique (tenant_id, cpf);

-- Impedir nome de grupo duplicado por tenant
alter table public.grupos_parceiros
add constraint unique_grupo_por_tenant
unique (tenant_id, nome);

-- ==============================================================================
-- ATIVAR RLS (Row Level Security)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.grupos_parceiros enable row level security;
alter table public.leads enable row level security;
alter table public.comissoes enable row level security;

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA MULTI-TENANT
-- O acesso depende do tenant_id que virá no JWT (recomendado para evitar recursão infinita).
-- Também incluiremos uma política complementar de Autenticação/Criação.
-- ==============================================================================

-- profiles
create policy "Isolamento por tenant - profiles"
on public.profiles
for all
to authenticated
using (
  tenant_id::text = auth.jwt()->>'tenant_id'
)
with check (
  tenant_id::text = auth.jwt()->>'tenant_id'
);

-- Para permitir que um perfil recém-criado seja lido pelo próprio usuário e criado mesmo sem ter JWT com tenant_id ainda:
create policy "Usuário pode gerenciar próprio profile"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- grupos_parceiros
create policy "Isolamento por tenant - grupos"
on public.grupos_parceiros
for all
to authenticated
using (
  tenant_id::text = auth.jwt()->>'tenant_id'
)
with check (
  tenant_id::text = auth.jwt()->>'tenant_id'
);

-- leads
create policy "Isolamento por tenant - leads"
on public.leads
for all
to authenticated
using (
  tenant_id::text = auth.jwt()->>'tenant_id'
)
with check (
  tenant_id::text = auth.jwt()->>'tenant_id'
);

-- comissoes
create policy "Isolamento por tenant - comissoes"
on public.comissoes
for all
to authenticated
using (
  tenant_id::text = auth.jwt()->>'tenant_id'
)
with check (
  tenant_id::text = auth.jwt()->>'tenant_id'
);

-- ==============================================================================
-- FUNCTION: AUTH HOOK (Injetar tenant_id no JWT)
-- Recomendação de implementação para injetar o tenant_id no token JWT
-- ==============================================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
  declare
    claims jsonb;
    user_tenant_id uuid;
  begin
    -- Buscar o tenant_id associado ao usuário na tabela profiles
    select tenant_id into user_tenant_id from public.profiles where id = (event->>'user_id')::uuid;

    claims := event->'claims';
    
    if user_tenant_id is not null then
      -- Injeta o tenant_id no token
      claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id));
    end if;

    -- Retorna o evento modificado com as novas claims
    event := jsonb_set(event, '{claims}', claims);
    return event;
  end;
$$;

-- Grant necessário para a função hook
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

