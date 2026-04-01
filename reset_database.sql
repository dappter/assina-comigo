-- CUIDADO: ESTE SCRIPT APAGARÁ TODOS OS DADOS DO SISTEMA!
-- Ele irá apagar todas as indicações, todas as comissões, todos os perfis e todos os logins.
-- ATENÇÃO: Execute isso apenas no ambiente de Desenvolvimento/Testes pela aba "SQL Editor" do Supabase.

-- 1. Apaga os dados de comissões, leads e perfis (CASCADE garante que as dependências sumam juntas)
TRUNCATE TABLE public.comissoes CASCADE;
TRUNCATE TABLE public.leads CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 2. Apaga todos os Grupos Cadastrados (se aplicável ao teste do zero)
TRUNCATE TABLE public.grupos_parceiros CASCADE;

-- 3. Deleta todos os logins (usuários) do sistema de autenticação
-- Isso forçará a perda de todos os tokens e exigirá novos cadastros.
DELETE FROM auth.users;

-- Script para colar lá no SQL Editor do Supabase (Aba de SQL à esquerda do painel).
-- Feito isso, o banco e auth estão vazios.
