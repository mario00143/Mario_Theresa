-- Enables Supabase Realtime (logical replication) for exactly the five
-- Wedding Day operational tables the client subscribes to (section 28) —
-- every other table is deliberately left off this publication so it never
-- streams changes to any client, keeping realtime minimal and targeted.

alter publication supabase_realtime add table public.live_issues;
alter publication supabase_realtime add table public.run_sheet_items;
alter publication supabase_realtime add table public.vendor_day_statuses;
alter publication supabase_realtime add table public.ceremony_item_movements;
alter publication supabase_realtime add table public.closeout_items;
