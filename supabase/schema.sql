-- Run this in the Supabase SQL editor once, on a fresh project.
-- Design principle: the browser (anon key) can read published book listings
-- and nothing else. Every write — order creation, payment confirmation,
-- download issuance — happens only from server code using the SERVICE ROLE
-- key, which never ships to the client. Row Level Security is ON on every
-- table and denies by default; only the one SELECT policy below is open.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- BOOKS — the catalog. Prices are in cents, in the DB, server-side only.
-- The client never sends a price; the server always looks it up here.
-- ---------------------------------------------------------------------
create table books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  price_cents int not null check (price_cents > 0),
  is_hero boolean not null default false,
  storage_path text not null, -- path inside the private 'books' storage bucket
  created_at timestamptz not null default now()
);

insert into books (slug, title, price_cents, is_hero, storage_path) values
  ('the-discipline-code', 'The Discipline Code', 999, true, 'the-discipline-code.pdf'),
  ('the-science-of-raising-humans', 'The Science of Raising Humans', 599, false, 'the-science-of-raising-humans.pdf'),
  ('10-minute-morning-productivity-hack', '10-Minute Morning Productivity Hack', 599, false, '10-minute-morning-productivity-hack.pdf');

-- ---------------------------------------------------------------------
-- INFLUENCERS — one row per referral link (/r/[slug]).
-- ---------------------------------------------------------------------
create table influencers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,       -- what goes in the bio link: hemansh.vercel.app/r/<slug>
  name text not null,
  discount_pct int not null default 20 check (discount_pct between 0 and 90),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ORDERS — one row per checkout attempt. status only ever becomes 'paid'
-- from the server after PayPal confirms the capture AND the amount matches
-- what the server itself computed (never trusts a client-supplied price).
-- ---------------------------------------------------------------------
create type order_status as enum ('pending', 'paid', 'failed');

create table orders (
  id uuid primary key default gen_random_uuid(),
  paypal_order_id text unique,          -- PayPal's own order id, dedupes webhook + client confirm racing
  book_id uuid not null references books(id),
  influencer_id uuid references influencers(id),
  amount_cents int not null,            -- what was actually charged, after any referral discount
  status order_status not null default 'pending',
  buyer_email text,                     -- set only after the post-purchase claim step
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_status_idx on orders (status);
create index orders_influencer_idx on orders (influencer_id) where influencer_id is not null;

-- ---------------------------------------------------------------------
-- DOWNLOADS — one row per paid order, created only once status='paid'.
-- The token is the only thing that can fetch the file, and only when
-- paired with the exact email the buyer claimed it with.
-- ---------------------------------------------------------------------
create table downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references orders(id),
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  email text,                 -- null until claimed; immutable once set (enforced in app code)
  claimed_at timestamptz,
  download_count int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security — deny-by-default. Only the book catalog is public.
-- ---------------------------------------------------------------------
alter table books enable row level security;
alter table influencers enable row level security;
alter table orders enable row level security;
alter table downloads enable row level security;

create policy "public can read the catalog" on books for select using (true);
-- No policies at all on influencers/orders/downloads for the anon role:
-- with RLS enabled and zero policies, every access from the browser's
-- anon key is denied. Only server code using the service role key
-- (which bypasses RLS by design) can touch these tables.
