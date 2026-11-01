-- Daily limits on Claude calls: one counter per user and one for the whole app.
-- Days roll over at midnight IST. Run once in the Supabase SQL editor.

create table if not exists usage_daily (
  user_id text not null,
  usage_date date not null,
  call_count integer not null default 0 check (call_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create table if not exists app_usage_daily (
  usage_date date primary key,
  call_count integer not null default 0 check (call_count >= 0),
  updated_at timestamptz not null default now()
);

-- RLS with no policies, like the other tables: only the service_role key has access.
alter table usage_daily enable row level security;
alter table app_usage_daily enable row level security;

-- Atomically takes one call from both limits, so parallel requests can't slip
-- past them. The conditional upserts lock the row, and take effect only while
-- the count is under the limit.
create or replace function consume_ai_call(
  p_user_id text,
  p_user_limit integer,
  p_app_limit integer
)
returns jsonb
language plpgsql
as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_user_count integer;
  v_app_count integer;
begin
  insert into usage_daily as u (user_id, usage_date, call_count)
  values (p_user_id, v_today, 1)
  on conflict (user_id, usage_date) do update
    set call_count = u.call_count + 1, updated_at = now()
    where u.call_count < p_user_limit
  returning call_count into v_user_count;

  if v_user_count is null then
    return jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'usage_date', v_today);
  end if;

  insert into app_usage_daily as a (usage_date, call_count)
  values (v_today, 1)
  on conflict (usage_date) do update
    set call_count = a.call_count + 1, updated_at = now()
    where a.call_count < p_app_limit
  returning call_count into v_app_count;

  if v_app_count is null then
    update usage_daily
      set call_count = call_count - 1, updated_at = now()
      where user_id = p_user_id and usage_date = v_today;
    return jsonb_build_object('allowed', false, 'reason', 'app_limit', 'usage_date', v_today);
  end if;

  return jsonb_build_object('allowed', true, 'reason', null, 'usage_date', v_today);
end;
$$;

-- Gives a call back when Claude fails, so errors don't use up anyone's limit.
create or replace function release_ai_call(p_user_id text, p_usage_date date)
returns void
language sql
as $$
  update usage_daily
    set call_count = greatest(call_count - 1, 0), updated_at = now()
    where user_id = p_user_id and usage_date = p_usage_date;
  update app_usage_daily
    set call_count = greatest(call_count - 1, 0), updated_at = now()
    where usage_date = p_usage_date;
$$;

-- Supabase exposes public functions over its API, so lock these to the server.
revoke all on function consume_ai_call(text, integer, integer) from public, anon, authenticated;
revoke all on function release_ai_call(text, date) from public, anon, authenticated;
grant execute on function consume_ai_call(text, integer, integer) to service_role;
grant execute on function release_ai_call(text, date) to service_role;
