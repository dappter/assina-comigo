-- Índices para melhorar a performance de consultas RLS e filtros por tenant_id

-- Perfis
create index if not exists idx_profiles_tenant_id on public.profiles(tenant_id);

-- Comissões
create index if not exists idx_comissoes_tenant_id on public.comissoes(tenant_id);

-- Obs: grupos_parceiros já possui "unique (tenant_id, nome)" e
-- leads já possui "unique (tenant_id, cpf)" que geram índices compostos encabeçados por tenant_id.
