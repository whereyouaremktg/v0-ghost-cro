-- Create stores table for Shopify OAuth tokens
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop TEXT NOT NULL, -- e.g., "mystore.myshopify.com"
  access_token TEXT NOT NULL, -- Encrypted Shopify OAuth token
  scopes TEXT[], -- Array of granted scopes
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, shop) -- One store per user (can be extended later for multi-store)
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own stores
CREATE POLICY "stores_select_own" ON public.stores 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stores_insert_own" ON public.stores 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stores_update_own" ON public.stores 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "stores_delete_own" ON public.stores 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_shop ON public.stores(shop);
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active) WHERE is_active = true;

-- Add comment for documentation
COMMENT ON TABLE public.stores IS 'Shopify store connections with OAuth tokens';
COMMENT ON COLUMN public.stores.access_token IS 'Shopify OAuth access token - should be encrypted in production';
COMMENT ON COLUMN public.stores.scopes IS 'Array of Shopify API scopes granted to this app';

