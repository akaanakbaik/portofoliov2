-- Optimistic content conflicts are permanent conflicts, not retryable serialization failures.
do $$
begin
 execute replace(pg_get_functiondef('public.portfolio_gateway(text,text,jsonb)'::regprocedure), 'errcode=''40001''', 'errcode=''23505''');
end $$;
