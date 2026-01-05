CREATE TABLE IF NOT EXISTS public.store_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  
  -- Core Metrics
  estimated_sales_monthly NUMERIC,
  estimated_traffic_monthly NUMERIC,
  global_rank INTEGER,
  industry TEXT,
  platform TEXT,
  
  -- Tech Stack (The "Secret Sauce")
  technologies JSONB, 
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.store_intelligence ENABLE ROW LEVEL SECURITY;

-- Everyone can read (it's public benchmark data), but only Service Role can write
CREATE POLICY "Allow public read" ON public.store_intelligence 
  FOR SELECT USING (true);

