-- Deal Assistant log: every question and answer, plus the daily per-person limit.
-- Server-only: RLS on with no policies, so only the service role can read or write it.
create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  deal_id text,
  step text,
  role text,
  question text not null,
  answer text,
  model text
);
create index if not exists assistant_messages_user_time on public.assistant_messages (user_id, created_at desc);
alter table public.assistant_messages enable row level security;

-- "Connect your own AI": private connector links. Only a hash of the secret is stored.
-- Server-only (service role), RLS on with no policies.
create table if not exists public.ai_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists ai_links_user_idx on public.ai_links(user_id);
alter table public.ai_links enable row level security;
