-- Security pass (Oct 16 2026). Needs to be run once in Supabase (SQL editor).
-- The app never writes to the database from the browser; every write goes through
-- server routes with the service role. These policies let any signed-in user
-- (including one-tap guest accounts) change deals, offers, documents and profiles
-- directly with the public key, skipping the server's rules. Keep only reads.
drop policy if exists "Deal parties can update deal" on public.deals;
drop policy if exists "Initiator can delete deal" on public.deals;
drop policy if exists "Initiator can insert deal" on public.deals;
drop policy if exists "Deal parties can insert documents" on public.documents;
drop policy if exists "Deal parties can update documents" on public.documents;
drop policy if exists "Deal parties can insert messages" on public.messages;
drop policy if exists "Users can update own notifications" on public.notifications;
drop policy if exists "Deal parties can insert offers" on public.offers;
drop policy if exists "Deal parties can update offers" on public.offers;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Storage: these let ANY signed-in user read, upload or delete ANY deal's files.
drop policy if exists "Authenticated users can upload deal documents" on storage.objects;
drop policy if exists "Deal parties can delete their documents" on storage.objects;
drop policy if exists "Deal parties can view their documents" on storage.objects;

-- Server-only helper functions: not callable through the public API.
revoke execute on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
revoke execute on function public.notify_admin_new_deal() from public, anon, authenticated;
grant execute on function public.notify_admin_new_deal() to service_role;

-- Tables only the server uses: no access at all for the public roles.
revoke all on public.comm_optouts, public.comm_prefs, public.sms_log, public.express_deals,
  public.express_waitlist, public.hin_builders, public.uscg_cache, public.rate_limits
  from anon, authenticated;
