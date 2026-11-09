-- =========================================================
-- GymGramps — schema inicial (MVP)
-- Convenção: perfis.id == auth.users.id (1:1 com o usuário do Supabase Auth)
-- =========================================================

-- ---------------------------------------------------------
-- PERFIL / ONBOARDING
-- ---------------------------------------------------------
create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  idade smallint,
  sexo text check (sexo in ('masculino', 'feminino', 'outro')),
  peso_atual_kg numeric(5,2),
  altura_cm numeric(5,2),
  objetivo_principal text check (
    objetivo_principal in ('ganho_massa', 'perda_gordura', 'manutencao', 'condicionamento')
  ),
  meta_peso_kg numeric(5,2),
  meta_prazo_dias integer,
  consentimento_lgpd_em timestamptz,
  versao_termos_aceitos text,
  plano text not null default 'free' check (plano in ('free', 'premium')),
  onboarding_concluido boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- horários fixos informados no onboarding (trabalho, faculdade, sono...)
create table horarios_fixos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  tipo text not null check (tipo in ('trabalho', 'faculdade', 'sono', 'outro')),
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0 = domingo
  hora_inicio time not null,
  hora_fim time not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PLANO DE TREINO
-- ---------------------------------------------------------
create table planos_treino (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  dias_por_semana smallint not null,
  divisao text, -- ex: "Push/Pull/Legs", "Upper/Lower"
  status text not null default 'ativo' check (status in ('ativo', 'arquivado')),
  gerado_em timestamptz not null default now()
);

create table treino_dia (
  id uuid primary key default gen_random_uuid(),
  plano_treino_id uuid not null references planos_treino(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  nome text not null -- ex: "Push", "Pull", "Legs"
);

create table exercicio_treino_dia (
  id uuid primary key default gen_random_uuid(),
  treino_dia_id uuid not null references treino_dia(id) on delete cascade,
  nome_exercicio text not null,
  series_alvo smallint,
  reps_alvo text, -- ex: "8-12"
  ordem smallint not null default 0
);

-- ---------------------------------------------------------
-- PROGRESSÃO DE TREINO (CRUD puro, sem IA)
-- ---------------------------------------------------------
create table sessoes_treino (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  treino_dia_id uuid references treino_dia(id) on delete set null,
  data date not null default current_date,
  observacoes_gerais text,
  created_at timestamptz not null default now()
);

create table exercicio_sessao (
  id uuid primary key default gen_random_uuid(),
  sessao_treino_id uuid not null references sessoes_treino(id) on delete cascade,
  nome_exercicio text not null,
  ordem smallint not null default 0
);

create table series (
  id uuid primary key default gen_random_uuid(),
  exercicio_sessao_id uuid not null references exercicio_sessao(id) on delete cascade,
  numero_serie smallint not null,
  carga_kg numeric(6,2),
  reps smallint,
  observacao text
);

-- ---------------------------------------------------------
-- PLANO ALIMENTAR
-- ---------------------------------------------------------
create table planos_alimentares (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  tmb_calculada numeric(7,2),
  meta_calorica numeric(7,2),
  macros_json jsonb, -- { "proteina_g": 150, "carbo_g": 250, "gordura_g": 70 }
  status text not null default 'ativo' check (status in ('ativo', 'arquivado')),
  gerado_em timestamptz not null default now()
);

create table refeicoes_plano (
  id uuid primary key default gen_random_uuid(),
  plano_alimentar_id uuid not null references planos_alimentares(id) on delete cascade,
  nome text not null, -- ex: "Café da manhã"
  horario_sugerido time,
  itens_json jsonb, -- lista de alimentos/quantidades sugeridos pela IA
  ordem smallint not null default 0
);

-- ---------------------------------------------------------
-- DIÁRIO ALIMENTAR (registro real do usuário)
-- ---------------------------------------------------------
create table diario_alimentar (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  data date not null default current_date,
  refeicao text not null,
  alimentos_json jsonb,
  calorias_estimadas numeric(7,2),
  macros_estimados jsonb,
  origem text not null default 'manual' check (origem in ('manual', 'busca_base', 'foto_ia')), -- foto_ia = fase 2 (paga)
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- CRONOGRAMA DIÁRIO (o output do "encaixe na rotina" — o USP)
-- ---------------------------------------------------------
create table cronogramas_diarios (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  data_referencia date not null,
  blocos_json jsonb not null, -- [{ horario, tipo (treino|refeicao|descanso), descricao }]
  gerado_em timestamptz not null default now(),
  unique (perfil_id, data_referencia)
);

-- ---------------------------------------------------------
-- CHAT DE IA (contextual ao plano do usuário)
-- ---------------------------------------------------------
create table conversas_chat (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  titulo text,
  created_at timestamptz not null default now()
);

create table mensagens_chat (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references conversas_chat(id) on delete cascade,
  papel text not null check (papel in ('user', 'assistant')),
  conteudo text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- CONTROLE DE USO DE IA POR USUÁRIO (base do modelo freemium)
-- ---------------------------------------------------------
create table uso_ia (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  tipo_chamada text not null check (
    tipo_chamada in ('onboarding_dieta', 'onboarding_treino', 'cronograma', 'chat', 'foto_alimento')
  ),
  mes_referencia date not null, -- sempre dia 1 do mês, ex: 2026-08-01
  contagem integer not null default 0,
  provider_usado text, -- ex: 'gemini-2.5-flash', 'fallback-openai' (observabilidade do fallback de IA)
  updated_at timestamptz not null default now(),
  unique (perfil_id, tipo_chamada, mes_referencia)
);

-- =========================================================
-- ÍNDICES
-- =========================================================
create index idx_horarios_fixos_perfil on horarios_fixos(perfil_id);
create index idx_planos_treino_perfil on planos_treino(perfil_id, status);
create index idx_treino_dia_plano on treino_dia(plano_treino_id);
create index idx_exercicio_treino_dia_treino on exercicio_treino_dia(treino_dia_id);
create index idx_sessoes_treino_perfil_data on sessoes_treino(perfil_id, data desc);
create index idx_exercicio_sessao_sessao on exercicio_sessao(sessao_treino_id);
create index idx_series_exercicio_sessao on series(exercicio_sessao_id);
create index idx_planos_alimentares_perfil on planos_alimentares(perfil_id, status);
create index idx_refeicoes_plano_plano on refeicoes_plano(plano_alimentar_id);
create index idx_diario_alimentar_perfil_data on diario_alimentar(perfil_id, data desc);
create index idx_cronogramas_perfil_data on cronogramas_diarios(perfil_id, data_referencia desc);
create index idx_conversas_perfil on conversas_chat(perfil_id);
create index idx_mensagens_conversa on mensagens_chat(conversa_id, created_at);
create index idx_uso_ia_perfil_mes on uso_ia(perfil_id, mes_referencia);

-- =========================================================
-- ROW LEVEL SECURITY — cada usuário só acessa os próprios dados
-- (defesa em profundidade: vale mesmo se só o backend, com a
-- service role key, falar com o banco no MVP)
-- =========================================================
alter table perfis enable row level security;
alter table horarios_fixos enable row level security;
alter table planos_treino enable row level security;
alter table treino_dia enable row level security;
alter table exercicio_treino_dia enable row level security;
alter table sessoes_treino enable row level security;
alter table exercicio_sessao enable row level security;
alter table series enable row level security;
alter table planos_alimentares enable row level security;
alter table refeicoes_plano enable row level security;
alter table diario_alimentar enable row level security;
alter table cronogramas_diarios enable row level security;
alter table conversas_chat enable row level security;
alter table mensagens_chat enable row level security;
alter table uso_ia enable row level security;

create policy "perfil dono" on perfis
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "horarios do dono" on horarios_fixos
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "planos_treino do dono" on planos_treino
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "treino_dia do dono" on treino_dia
  for all using (exists (
    select 1 from planos_treino pt
    where pt.id = treino_dia.plano_treino_id and pt.perfil_id = auth.uid()
  ));

create policy "exercicio_treino_dia do dono" on exercicio_treino_dia
  for all using (exists (
    select 1 from treino_dia td
    join planos_treino pt on pt.id = td.plano_treino_id
    where td.id = exercicio_treino_dia.treino_dia_id and pt.perfil_id = auth.uid()
  ));

create policy "sessoes_treino do dono" on sessoes_treino
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "exercicio_sessao do dono" on exercicio_sessao
  for all using (exists (
    select 1 from sessoes_treino st
    where st.id = exercicio_sessao.sessao_treino_id and st.perfil_id = auth.uid()
  ));

create policy "series do dono" on series
  for all using (exists (
    select 1 from exercicio_sessao es
    join sessoes_treino st on st.id = es.sessao_treino_id
    where es.id = series.exercicio_sessao_id and st.perfil_id = auth.uid()
  ));

create policy "planos_alimentares do dono" on planos_alimentares
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "refeicoes_plano do dono" on refeicoes_plano
  for all using (exists (
    select 1 from planos_alimentares pa
    where pa.id = refeicoes_plano.plano_alimentar_id and pa.perfil_id = auth.uid()
  ));

create policy "diario_alimentar do dono" on diario_alimentar
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "cronogramas do dono" on cronogramas_diarios
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "conversas do dono" on conversas_chat
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

create policy "mensagens do dono" on mensagens_chat
  for all using (exists (
    select 1 from conversas_chat cc
    where cc.id = mensagens_chat.conversa_id and cc.perfil_id = auth.uid()
  ));

create policy "uso_ia do dono" on uso_ia
  for all using (auth.uid() = perfil_id) with check (auth.uid() = perfil_id);

-- =========================================================
-- TRIGGER: cria a linha em `perfis` automaticamente quando
-- um usuário se cadastra via Supabase Auth
-- =========================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
