-- ============================================================================
--  ClicMénage — Phase 2 backend foundation — initial schema
-- ============================================================================
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New
-- query → paste → Run), BEFORE 0002_row_level_security.sql. See the
-- "Supabase Setup" section of README.md for click-by-click instructions.
--
-- Design notes:
--   - Every enum below mirrors a TypeScript union already used by the
--     Pricing Engine V1.1 (src/lib/pricing/pricing-config.ts,
--     src/lib/pricing/engine.ts, src/lib/booking/status.ts). Nothing here
--     invents a second nomenclature for the same concepts.
--   - `bookings` stores a full, immutable PRICING SNAPSHOT (see comment
--     above that table) so a future change to the Pricing Engine can never
--     retroactively change what an existing customer was quoted.
--   - `hourly_wage` on `cleaners` is strictly administrative — never
--     selected by any client-facing query (see toPublicCleaner() in
--     src/lib/db/repositories/cleaners.ts).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums — one per Pricing Engine V1.1 / booking wizard concept
-- ----------------------------------------------------------------------------

create type booking_status as enum (
  'pending_review',
  'awaiting_payment',
  'confirmed',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'issue'
);

create type payment_status as enum (
  'unpaid',
  'authorized',
  'paid',
  'refunded',
  'failed'
);

create type service_pricing_key as enum ('regular', 'deep', 'move');

create type frequency_key as enum ('once', 'weekly', 'biweekly', 'every4weeks');

create type housing_type as enum ('condo_apartment', 'house', 'townhouse', 'duplex_triplex');

create type sqft_bucket as enum (
  'under750', '750_999', '1000_1499', '1500_1999',
  '2000_2499', '2500_2999', '3000plus', 'unknown'
);

create type last_cleaning as enum (
  'under1month', '1to3months', '3to6months', 'over6months', 'over1year', 'unknown'
);

create type pet_hair as enum ('none', 'some', 'heavy');

create type furnishing_state as enum ('empty', 'partly_furnished', 'furnished');

create type manual_review_reason as enum (
  'large_sqft',
  'six_plus_bedrooms',
  'four_plus_full_bathrooms',
  'three_plus_half_bathrooms',
  'three_plus_floors'
);

create type status_changed_by as enum ('system', 'admin', 'customer');

-- ----------------------------------------------------------------------------
-- updated_at helper trigger
-- ----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- customers
-- ----------------------------------------------------------------------------

create table customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case-insensitive uniqueness on email is the dedup key: findOrCreateCustomer()
-- looks up by lower(email) before inserting, and this index makes that a
-- guaranteed single row even under concurrent requests.
create unique index customers_email_lower_idx on customers (lower(email));

create trigger trg_customers_updated_at
before update on customers
for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- bookings
-- ============================================================================
--  PRICING SNAPSHOT (immutable) — see requirement 6 of the Phase 2 spec.
--  Every column from pricing_version through qst_amount/total_amount is
--  copied from the server-recomputed PricingBreakdown at the moment the
--  booking is created and NEVER recalculated or overwritten afterward. If
--  pricing-config.ts changes six months from now, this row keeps quoting
--  what the customer actually agreed to.
-- ============================================================================

create table bookings (
  id uuid primary key default gen_random_uuid(),
  confirmation_number text not null unique,
  customer_id uuid not null references customers(id) on delete restrict,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status booking_status not null default 'awaiting_payment',
  payment_status payment_status not null default 'unpaid',

  service_type service_pricing_key not null,
  frequency frequency_key not null,
  requested_date date not null,
  requested_time_window_id text not null,

  -- Address, captured as entered at booking time (not a live FK to a
  -- separate addresses table — a booking's service address is a one-time
  -- fact, not something we need to normalize yet).
  address_line text not null,
  unit text,
  city text not null,
  province text not null default 'QC',
  postal_code text not null,

  -- Home characteristics — same enums/buckets the Pricing Engine uses.
  dwelling_type housing_type not null,
  bedrooms smallint not null check (bedrooms >= 0),
  full_bathrooms smallint not null check (full_bathrooms >= 1),
  half_bathrooms smallint not null check (half_bathrooms >= 0),
  square_footage_bucket sqft_bucket not null,
  floors smallint check (floors is null or floors >= 1),
  last_cleaning last_cleaning not null,
  pet_hair pet_hair not null,
  furnishing_state furnishing_state,

  instructions text,

  manual_review_required boolean not null default false,
  manual_review_reasons manual_review_reason[] not null default '{}',

  -- --- Immutable pricing snapshot (server-recomputed, never client-sent) ---
  pricing_version text not null,
  base_cleaning_person_hours numeric(6, 2) not null,
  extras_person_hours numeric(6, 2) not null,
  estimated_person_hours numeric(6, 2) not null,
  reported_operational_hours numeric(6, 2) not null,
  recommended_crew_size smallint not null,
  cleaning_price numeric(10, 2) not null,
  extras_total numeric(10, 2) not null,
  discount_amount numeric(10, 2) not null default 0,
  subtotal_before_tax numeric(10, 2) not null,
  gst_amount numeric(10, 2) not null default 0,
  qst_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null,
  currency text not null default 'CAD',
  -- Secondary/evolving breakdown (e.g. per-line-item labels) — structured
  -- columns above cover everything that must never silently change shape;
  -- this is only for extra detail that's convenient, not load-bearing.
  pricing_breakdown jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_customer_id_idx on bookings (customer_id);
create index bookings_status_idx on bookings (status);
create index bookings_confirmation_number_idx on bookings (confirmation_number);

create trigger trg_bookings_updated_at
before update on bookings
for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- booking_extras — one immutable snapshot row per selected extra
-- ----------------------------------------------------------------------------

create table booking_extras (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  extra_id text not null,
  quantity smallint not null default 1 check (quantity >= 1),
  unit_price_snapshot numeric(10, 2) not null,
  total_price_snapshot numeric(10, 2) not null,
  operational_person_hours_snapshot numeric(6, 2) not null,
  created_at timestamptz not null default now()
);

create index booking_extras_booking_id_idx on booking_extras (booking_id);

-- ----------------------------------------------------------------------------
-- booking_status_history — simple, auditable trail of status changes
-- ----------------------------------------------------------------------------

create table booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  from_status booking_status,
  to_status booking_status not null,
  changed_at timestamptz not null default now(),
  changed_by_type status_changed_by not null default 'system',
  note text
);

create index booking_status_history_booking_id_idx on booking_status_history (booking_id);

-- ----------------------------------------------------------------------------
-- cleaners — future employees. hourly_wage is STRICTLY administrative.
-- ----------------------------------------------------------------------------

create table cleaners (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  active boolean not null default true,
  hourly_wage numeric(6, 2) not null,
  hire_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_cleaners_updated_at
before update on cleaners
for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- job_assignments — one or more cleaners per booking, no accidental dupes
-- ----------------------------------------------------------------------------

create table job_assignments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  cleaner_id uuid not null references cleaners(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  scheduled_start timestamptz,
  unique (booking_id, cleaner_id)
);

create index job_assignments_booking_id_idx on job_assignments (booking_id);
create index job_assignments_cleaner_id_idx on job_assignments (cleaner_id);

-- ----------------------------------------------------------------------------
-- job_time_logs — actual worked time per cleaner per booking.
-- actual_minutes is computed automatically (trigger below) so it can never
-- drift from started_at/ended_at. Deliberately NOT tracking GPS, screenshots,
-- or any other invasive monitoring — just start/end time and an optional note.
-- ----------------------------------------------------------------------------

create table job_time_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  cleaner_id uuid not null references cleaners(id) on delete restrict,
  started_at timestamptz not null,
  ended_at timestamptz,
  actual_minutes integer,
  note text,
  created_at timestamptz not null default now(),
  constraint job_time_logs_ended_after_started check (ended_at is null or ended_at > started_at)
);

create index job_time_logs_booking_id_idx on job_time_logs (booking_id);
create index job_time_logs_cleaner_id_idx on job_time_logs (cleaner_id);

create or replace function compute_actual_minutes()
returns trigger as $$
begin
  if new.ended_at is not null then
    new.actual_minutes = greatest(0, round(extract(epoch from (new.ended_at - new.started_at)) / 60));
  else
    new.actual_minutes = null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_job_time_logs_actual_minutes
before insert or update on job_time_logs
for each row execute function compute_actual_minutes();
