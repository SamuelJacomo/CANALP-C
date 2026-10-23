-- Execute no SQL Editor do Supabase.
-- Nome é opcional; a data/hora é criada pelo banco.
create extension if not exists pgcrypto;

create table if not exists public.manifestacoes (
  id uuid primary key default gen_random_uuid(),
  nome text null check (nome is null or char_length(trim(nome)) between 1 and 120),
  mensagem text not null check (char_length(trim(mensagem)) between 1 and 5000),
  enviado_em timestamptz not null default now()
);

alter table public.manifestacoes enable row level security;

revoke all on public.manifestacoes from anon, authenticated;
grant insert on public.manifestacoes to anon, authenticated;
grant select on public.manifestacoes to authenticated;

drop policy if exists "Public can submit feedback" on public.manifestacoes;
drop policy if exists "Authenticated team can read feedback" on public.manifestacoes;

create policy "Public can submit feedback"
on public.manifestacoes for insert to anon, authenticated
with check (
  (nome is null or char_length(trim(nome)) between 1 and 120)
  and char_length(trim(mensagem)) between 1 and 5000
);

-- Esta policy só permite leitura a sessões autenticadas.
-- IMPORTANTE: desative o cadastro público em Supabase Auth > Providers/Signups
-- e crie as contas da equipe do P&C manualmente. Não compartilhe usuários/senhas.
create policy "Authenticated team can read feedback"
on public.manifestacoes for select to authenticated
using (auth.uid() is not null);

-- Não crie policies públicas para SELECT, UPDATE ou DELETE.
-- O banco grava enviado_em em UTC; o painel exibe o horário de Brasília.
