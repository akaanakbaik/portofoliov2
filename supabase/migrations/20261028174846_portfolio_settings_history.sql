create table if not exists portfolio_private.settings_history (
 version integer primary key, settings jsonb not null, created_at timestamptz not null default now()
);
alter table portfolio_private.settings_history enable row level security;
revoke all on portfolio_private.settings_history from public,anon,authenticated;

create or replace function public.portfolio_gateway(p_token text,p_action text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; hits integer; v integer; row_message portfolio_private.messages;
begin
 if length(coalesce(p_token,'')) < 40 or not exists(select 1 from portfolio_private.state where backend_token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex')) then
  raise exception 'Unauthorized' using errcode='42501';
 end if;
 case p_action
 when 'settings.get' then select jsonb_build_object('settings',settings,'version',version) into result from portfolio_private.state;
 when 'settings.history' then select coalesce(jsonb_agg(to_jsonb(h) order by version desc),'[]') into result from (select * from portfolio_private.settings_history order by version desc limit 10) h;
 when 'settings.save' then
  if jsonb_typeof(p_data->'settings')<>'object' or octet_length((p_data->'settings')::text)>200000 then raise exception 'Invalid settings'; end if;
  insert into portfolio_private.settings_history(version,settings) select version,settings from portfolio_private.state where settings is not null and version=(p_data->>'version')::int on conflict do nothing;
  update portfolio_private.state set settings=p_data->'settings',version=version+1,updated_at=now() where version=(p_data->>'version')::int returning version into v;
  if v is null then raise exception 'Settings changed; reload before saving' using errcode='40001'; end if;
  result:=jsonb_build_object('version',v);
 when 'auth.get' then select jsonb_build_object('hash',password_hash) into result from portfolio_private.state;
 when 'auth.seed' then update portfolio_private.state set password_hash=p_data->>'hash' where password_hash is null;
 when 'auth.password' then
  update portfolio_private.state set password_hash=p_data->>'hash',updated_at=now(); delete from portfolio_private.sessions;
 when 'session.create' then
  delete from portfolio_private.sessions where expires_at<now();
  insert into portfolio_private.sessions values(p_data->>'hash',now()+interval '24 hours');
 when 'session.check' then select jsonb_build_object('valid',exists(select 1 from portfolio_private.sessions where token_hash=p_data->>'hash' and expires_at>now())) into result;
 when 'session.revoke' then delete from portfolio_private.sessions where token_hash=p_data->>'hash';
 when 'rate.limit' then
  insert into portfolio_private.rate_limits values(p_data->>'bucket',1,now()+make_interval(secs=>least(86400,greatest(1,(p_data->>'seconds')::int))))
  on conflict(bucket) do update set hits=case when portfolio_private.rate_limits.resets_at<=now() then 1 else portfolio_private.rate_limits.hits+1 end,
   resets_at=case when portfolio_private.rate_limits.resets_at<=now() then excluded.resets_at else portfolio_private.rate_limits.resets_at end returning rate_limits.hits into hits;
  result:=jsonb_build_object('allowed',hits<=least(1000,greatest(1,(p_data->>'limit')::int)));
 when 'contact.insert' then
  insert into portfolio_private.messages(name,email,message) values(p_data->>'name',p_data->>'email',p_data->>'message') returning * into row_message;
  result:=jsonb_build_object('id',row_message.id);
 when 'contact.list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'email',email,'message',message,'timestamp',created_at,'read',read,'emailStatus',email_status) order by created_at desc),'[]') into result from (select * from portfolio_private.messages order by created_at desc limit 200) m;
 when 'contact.read' then update portfolio_private.messages set read=true where id=(p_data->>'id')::uuid;
 when 'contact.delete' then delete from portfolio_private.messages where id=(p_data->>'id')::uuid;
 when 'contact.claim' then
  with candidate as (select id from portfolio_private.messages where email_status<>'sent' and attempts<5 and (lease_until is null or lease_until<now()) and (p_data->>'id' is null or id=(p_data->>'id')::uuid) order by created_at for update skip locked limit 1)
  update portfolio_private.messages m set email_status='sending',attempts=attempts+1,lease_until=now()+interval '10 minutes' from candidate c where m.id=c.id returning m.* into row_message;
  if row_message.id is not null then result:=to_jsonb(row_message); end if;
 when 'contact.delivered' then update portfolio_private.messages set email_status=case when (p_data->>'ok')::boolean then 'sent' else 'failed' end,error_message=left(p_data->>'error',300),lease_until=now()+interval '30 minutes' where id=(p_data->>'id')::uuid;
 when 'analytics.stats' then result:=public.get_portfolio_visit_stats()::jsonb;
 when 'analytics.visit' then perform public.record_portfolio_visit();
 when 'cron.list' then
  select coalesce(jsonb_agg(to_jsonb(r) order by started_at desc),'[]') into result from (select * from public.portfolio_cron_runs where job_name='supabase-keepalive' order by started_at desc limit 100) r;
 when 'cron.record' then
  perform public.record_portfolio_cron_run('supabase-keepalive',p_data->>'triggerType',p_data->>'status',(p_data->>'startedAt')::timestamptz,(p_data->>'completedAt')::timestamptz,(p_data->>'durationMs')::int,p_data->'response',p_data->>'errorMessage');
  delete from portfolio_private.rate_limits where resets_at<now()-interval '1 day';
  delete from portfolio_private.sessions where expires_at<now();
 else raise exception 'Unknown action' using errcode='22023';
 end case;
 return coalesce(result,'{"ok":true}'::jsonb);
end $$;
revoke all on function public.portfolio_gateway(text,text,jsonb) from public;
grant execute on function public.portfolio_gateway(text,text,jsonb) to anon;
comment on function public.portfolio_gateway is 'Backend-only gateway; requires a 256-bit application token validated against a private SHA256 hash. All actions also require server-side authorization.';
