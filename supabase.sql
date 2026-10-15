create table transactions (
  id bigint generated always as identity primary key,
  type text not null check (type in ('income','expense','saving_in','saving_out')),
  amount bigint not null check (amount > 0),
  category text not null default 'lainnya',
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table transactions enable row level security;

create view summary as
select
  coalesce(sum(amount) filter (where type='income'),0) as income,
  coalesce(sum(amount) filter (where type='expense'),0) as expense,
  coalesce(sum(amount) filter (where type='saving_in'),0) as saving_in,
  coalesce(sum(amount) filter (where type='saving_out'),0) as saving_out
from transactions;
