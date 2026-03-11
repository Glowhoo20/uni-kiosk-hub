-- Migration to create kiosk_heartbeats table for tracking active hours

CREATE TABLE IF NOT EXISTS public.kiosk_heartbeats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kiosk_id TEXT NOT NULL DEFAULT 'main',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kiosk_heartbeats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert heartbeat (the kiosk is client-side)
CREATE POLICY "Allow anonymous inserts to kiosk_heartbeats" ON public.kiosk_heartbeats
  FOR INSERT
  TO public, anon
  WITH CHECK (true);

-- Allow admins to read heartbeats
CREATE POLICY "Allow authenticated users to read kiosk_heartbeats" ON public.kiosk_heartbeats
  FOR SELECT
  TO authenticated
  USING (true);
