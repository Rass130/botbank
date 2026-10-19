-- Jalankan satu per satu (query 1 sampai 4)
alter table transactions drop constraint if exists transactions_type_check; alter table transactions add constraint transactions_type_check check (type in ('income','expense','saving_in','saving_out','transfer','target_in'));

create table if not exists targets (id bigint generated always as identity primary key, name text not null, price bigint not null, link text, saved bigint not null default 0, status text not null default 'active', created_at timestamptz not null default now()); alter table targets enable row level security;

create table if not exists allowance (week text primary key, budget bigint not null default 0, settled boolean not null default false); alter table allowance enable row level security;

create table if not exists proposals (id bigint generated always as identity primary key, wallet text not null, amount bigint not null, tab bigint not null, tgt bigint not null, jajan bigint not null, tab_s text not null default 'pending', tgt_s text not null default 'pending', jj_s text not null default 'pending', created_at timestamptz not null default now()); alter table proposals enable row level security;
