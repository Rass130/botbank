-- Jalankan satu per satu (query 1, 2, 3)
alter table transactions add column if not exists wallet text not null default 'bank' check (wallet in ('cash','bank')), add column if not exists to_wallet text check (to_wallet in ('cash','bank'));

alter table transactions drop constraint if exists transactions_type_check; alter table transactions add constraint transactions_type_check check (type in ('income','expense','saving_in','saving_out','transfer'));

create or replace view wallet_balance as select w.wallet, coalesce(sum(case when t.wallet=w.wallet then (case t.type when 'income' then t.amount when 'saving_out' then t.amount else -t.amount end) else t.amount end),0) as balance from (values ('cash'),('bank')) as w(wallet) left join transactions t on t.wallet=w.wallet or t.to_wallet=w.wallet group by w.wallet;
