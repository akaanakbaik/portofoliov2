-- Apply only after the gateway-backed deployment is serving production.
revoke execute on function public.get_portfolio_visit_stats() from public,anon,authenticated;
revoke execute on function public.record_portfolio_visit() from public,anon,authenticated;
revoke execute on function public.get_portfolio_cron_dashboard(integer) from public,anon,authenticated;
revoke execute on function public.record_portfolio_cron_run(text,text,text,timestamptz,timestamptz,integer,jsonb,text) from public,anon,authenticated;
