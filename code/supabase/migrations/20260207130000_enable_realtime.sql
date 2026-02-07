-- 20260207130000_enable_realtime.sql
-- Migration: Enable Supabase Realtime on lists, list_items, and list_members tables
-- Description: Adds tables to the supabase_realtime publication so that Postgres Changes
--              are broadcast to connected clients via WebSockets.
--              This enables live updates across devices without polling.

-- Set REPLICA IDENTITY to FULL for the tables we want to track changes on.
-- This ensures UPDATE and DELETE events include the full row data (not just PKs).
ALTER TABLE public.lists REPLICA IDENTITY FULL;
ALTER TABLE public.list_items REPLICA IDENTITY FULL;
ALTER TABLE public.list_members REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication.
-- Supabase automatically creates this publication; we just need to add our tables.
ALTER PUBLICATION supabase_realtime ADD TABLE public.lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.list_members;
