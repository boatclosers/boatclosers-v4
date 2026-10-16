-- Security pass (Oct 16 2026). APPLIED to production.
-- The app never touches the database from the browser; every write goes through
-- server routes with the service role (which these changes don't affect).

-- Server-only helper functions: not callable through the public API.
revoke execute on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
revoke execute on function public.notify_admin_new_deal() from public, anon, authenticated;
grant execute on function public.notify_admin_new_deal() to service_role;

-- Tables only the server uses: no access at all for the public roles.
revoke all on public.comm_optouts, public.comm_prefs, public.sms_log, public.express_deals,
  public.express_waitlist, public.hin_builders, public.uscg_cache, public.rate_limits
  from anon, authenticated;

-- Browser roles may still READ their own rows (RLS policies), but never write.
-- (The old write policies remain defined but are inert without these grants.)
revoke insert, update, delete, truncate on public.deals, public.documents, public.messages,
  public.notifications, public.offers, public.profiles from anon, authenticated;

-- Storage: these let ANY signed-in user read, upload or delete ANY deal's files.
alter policy "Authenticated users can upload deal documents" on storage.objects with check (false);
alter policy "Deal parties can delete their documents" on storage.objects using (false);
alter policy "Deal parties can view their documents" on storage.objects using (false);
