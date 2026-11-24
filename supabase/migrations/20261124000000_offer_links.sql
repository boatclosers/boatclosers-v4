-- Public "make an offer" links for sellers to post in their ads.
-- One link per boat (offer_links). Every buyer who uses it gets their OWN new
-- deal with the seller, copied from the seller's deal (logged in offer_link_starts).
-- Server-only: RLS on with no policies, and no access for the public roles.

create table if not exists public.offer_links (
  code text primary key,
  source_deal_id uuid not null references public.deals(id) on delete cascade,
  seller_id uuid not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists offer_links_one_per_deal on public.offer_links (source_deal_id) where active;

create table if not exists public.offer_link_starts (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.offer_links(code) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  buyer_email text not null,
  created_at timestamptz not null default now()
);
create index if not exists offer_link_starts_code_time on public.offer_link_starts (code, created_at desc);
create unique index if not exists offer_link_starts_one_per_buyer on public.offer_link_starts (code, lower(buyer_email));

alter table public.offer_links enable row level security;
alter table public.offer_link_starts enable row level security;
revoke all on public.offer_links, public.offer_link_starts from anon, authenticated;
