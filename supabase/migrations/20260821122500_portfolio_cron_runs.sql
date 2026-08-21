create table if not exists public.portfolio_cron_runs (
  id bigint generated always as identity primary key,
  job_name text not null,
  trigger_type text not null check (trigger_type in ('scheduled', 'manual')),
  status text not null check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  response jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_cron_runs_started_at_idx on public.portfolio_cron_runs (started_at desc);
create index if not exists portfolio_cron_runs_job_name_idx on public.portfolio_cron_runs (job_name, started_at desc);

alter table public.portfolio_cron_runs enable row level security;
drop policy if exists portfolio_cron_runs_no_direct_access on public.portfolio_cron_runs;
create policy portfolio_cron_runs_no_direct_access on public.portfolio_cron_runs for all using (false) with check (false);

create or replace function public.record_portfolio_cron_run(
  p_job_name text,
  p_trigger_type text,
  p_status text,
  p_started_at timestamptz default now(),
  p_completed_at timestamptz default null,
  p_duration_ms integer default null,
  p_response jsonb default null,
  p_error_message text default null
)
returns public.portfolio_cron_runs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.portfolio_cron_runs;
begin
  if p_job_name is null or length(trim(p_job_name)) = 0 then
    raise exception 'job_name is required';
  end if;
  if p_trigger_type not in ('scheduled', 'manual') then
    raise exception 'invalid trigger_type';
  end if;
  if p_status not in ('running', 'success', 'failed') then
    raise exception 'invalid status';
  end if;
  insert into public.portfolio_cron_runs (job_name, trigger_type, status, started_at, completed_at, duration_ms, response, error_message)
  values (trim(p_job_name), p_trigger_type, p_status, coalesce(p_started_at, now()), p_completed_at, p_duration_ms, p_response, left(p_error_message, 2000))
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.get_portfolio_cron_dashboard(p_limit integer default 30)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 30), 100));
  v_latest public.portfolio_cron_runs;
  v_runs jsonb;
  v_total bigint;
  v_success bigint;
  v_failed bigint;
  v_last_success timestamptz;
  v_next_at timestamptz;
begin
  select * into v_latest from public.portfolio_cron_runs order by started_at desc limit 1;
  select count(*), count(*) filter (where status = 'success'), count(*) filter (where status = 'failed'), max(completed_at) filter (where status = 'success')
    into v_total, v_success, v_failed, v_last_success
    from public.portfolio_cron_runs;
  select jsonb_agg(to_jsonb(r) order by r.started_at desc)
    into v_runs
    from (select * from public.portfolio_cron_runs order by started_at desc limit v_limit) r;
  v_next_at := date_trunc('day', now()) + interval '3 hours';
  while v_next_at <= now() loop
    v_next_at := v_next_at + interval '2 days';
  end loop;
  return jsonb_build_object(
    'jobName', 'supabase-keepalive',
    'schedule', '0 3 */2 * *',
    'timezone', 'UTC',
    'nextScheduledAt', v_next_at,
    'lastSuccessAt', v_last_success,
    'totalRuns', v_total,
    'successRuns', v_success,
    'failedRuns', v_failed,
    'latest', case when v_latest.id is null then null else to_jsonb(v_latest) end,
    'runs', coalesce(v_runs, '[]'::jsonb),
    'generatedAt', now()
  );
end;
$$;

grant execute on function public.record_portfolio_cron_run(text, text, text, timestamptz, timestamptz, integer, jsonb, text) to anon, authenticated;
grant execute on function public.get_portfolio_cron_dashboard(integer) to anon, authenticated;
