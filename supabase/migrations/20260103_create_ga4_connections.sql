-- Create GA4 OAuth connections table
CREATE TABLE IF NOT EXISTS ga4_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL,
  selected_property_id TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE ga4_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own connections
CREATE POLICY "Users can view own GA4 connections"
  ON ga4_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GA4 connections"
  ON ga4_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GA4 connections"
  ON ga4_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GA4 connections"
  ON ga4_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_ga4_connections_user_id ON ga4_connections(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ga4_connections_updated_at BEFORE UPDATE
    ON ga4_connections FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
