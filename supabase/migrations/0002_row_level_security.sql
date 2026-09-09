-- ============================================================================
--  ClicMénage — Phase 2 backend foundation — Row Level Security
-- ============================================================================
-- Run this AFTER 0001_init_schema.sql, in the same SQL editor.
--
-- Policy: deny-by-default. RLS is enabled on every table below and NO
-- policy is created for the `anon` or `authenticated` roles — with RLS on
-- and zero policies, Postgres denies every row to those roles, full stop.
-- No `USING (true)` shortcuts anywhere in this file.
--
-- All application writes/reads go through src/lib/db/client.ts using the
-- Supabase SERVICE ROLE key, server-side only (API routes / repository
-- functions — never a browser). The service role key bypasses RLS by
-- design, so the app keeps working normally; what this migration prevents
-- is the PUBLIC anon key (the one that legitimately ships to the browser
-- for other Supabase features) from ever listing or reading customers,
-- bookings, cleaners, wages, assignments, or time logs.
--
-- When a future phase adds authenticated admin users, add narrowly-scoped
-- policies then (e.g. "admins can select bookings") — do not loosen this
-- file in the meantime.
-- ============================================================================

alter table customers enable row level security;
alter table bookings enable row level security;
alter table booking_extras enable row level security;
alter table booking_status_history enable row level security;
alter table cleaners enable row level security;
alter table job_assignments enable row level security;
alter table job_time_logs enable row level security;

-- Belt-and-suspenders: also revoke default table privileges from anon/
-- authenticated so even a future accidental policy has nothing to grant
-- access through without an explicit GRANT alongside it.
revoke all on customers, bookings, booking_extras, booking_status_history,
  cleaners, job_assignments, job_time_logs
  from anon, authenticated;
