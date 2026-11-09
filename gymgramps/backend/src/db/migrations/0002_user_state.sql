-- =========================================================
-- GymGramps — Schema V2: User State (Document-based JSONB)
-- Tabela usada diretamente pelo frontend dbApi.js
-- =========================================================

create table if not exists public.user_state (
  id uuid primary key references auth.users(id) on delete cascade,
  perfil jsonb,
  treino jsonb,
  dieta jsonb,
  cronograma jsonb,
  refeicoes jsonb,
  sessoes jsonb, -- [Novo] para logs de sessões no Treino
  liga_stats jsonb, -- [Novo] pontuação de gamificação da Liga
  updated_at timestamptz not null default now()
);

-- Habilitar a segurança em nível de linha (RLS)
alter table public.user_state enable row level security;

-- Política de Leitura: Usuário logado pode ler se o id bater
create policy "usuario pode ler proprio state" on public.user_state
  for select using (auth.uid() = id);

-- Política de Inserção: Usuário pode criar própria linha
create policy "usuario pode inserir proprio state" on public.user_state
  for insert with check (auth.uid() = id);

-- Política de Atualização: Usuário pode alterar própria linha
create policy "usuario pode atualizar proprio state" on public.user_state
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "usuario pode deletar proprio state" on public.user_state
  for delete using (auth.uid() = id);
