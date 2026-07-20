-- Hand-run in the Supabase SQL editor (same convention as Market_Cap — no
-- live migration system, this file exists for documentation/reproducibility).

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null,
  prompt text not null,
  output text not null,
  created_at timestamptz not null default now()
);
alter table generations enable row level security;
create policy "own generations" on generations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table quota_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,              -- 'YYYY-MM'
  count int not null default 0,
  primary key (user_id, month)
);
alter table quota_counters enable row level security;
create policy "read own quota" on quota_counters
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for the authenticated role — only the
-- increment_quota() RPC (security definer, see below) can write.

create table subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free'
    check (status = any (array['free','active','past_due','canceled'])),
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table subscriptions enable row level security;
create policy "read own subscription" on subscriptions
  for select using (auth.uid() = user_id);
-- Writes go through the service-role client only (src/lib/supabase/admin.ts),
-- from subscription-sync.ts.

-- Atomic quota check-and-increment. See README's "hard technical problem"
-- section for why this can't be a separate SELECT-then-UPDATE.
create or replace function increment_quota(p_user_id uuid, p_month text, p_limit int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  insert into quota_counters (user_id, month, count)
  values (p_user_id, p_month, 1)
  on conflict (user_id, month) do update
    set count = quota_counters.count + 1
    where quota_counters.count < p_limit
  returning count into new_count;

  return new_count;  -- NULL if the WHERE clause blocked the update (quota exhausted)
end;
$$;
