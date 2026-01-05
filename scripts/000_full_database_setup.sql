-- ============================================
-- Ghost CRO Complete Database Setup
-- Run this script in Supabase SQL Editor
-- ============================================

-- Step 1: Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  technical_contact_email TEXT,
  monthly_revenue_goal NUMERIC,
  crm_synced_at TIMESTAMPTZ,
  crm_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  tests_limit INTEGER NOT NULL DEFAULT 0,
  tests_used INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Shopify billing columns
  shopify_charge_id TEXT,
  shopify_shop TEXT,
  trial_ends_at TIMESTAMPTZ
);

-- Step 3: Create tests table (checkout analyses)
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  overall_score INTEGER,
  friction_score INTEGER,
  trust_score INTEGER,
  clarity_score INTEGER,
  mobile_score INTEGER,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Step 4: Create stores table for Shopify OAuth tokens
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scopes TEXT[],
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, shop)
);

-- Step 5: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Step 6: Profiles RLS Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Step 7: Subscriptions RLS Policies
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 8: Tests RLS Policies
DROP POLICY IF EXISTS "tests_select_own" ON public.tests;
DROP POLICY IF EXISTS "tests_insert_own" ON public.tests;
DROP POLICY IF EXISTS "tests_update_own" ON public.tests;
DROP POLICY IF EXISTS "tests_delete_own" ON public.tests;

CREATE POLICY "tests_select_own" ON public.tests 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tests_insert_own" ON public.tests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tests_update_own" ON public.tests 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tests_delete_own" ON public.tests 
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Stores RLS Policies
DROP POLICY IF EXISTS "stores_select_own" ON public.stores;
DROP POLICY IF EXISTS "stores_insert_own" ON public.stores;
DROP POLICY IF EXISTS "stores_update_own" ON public.stores;
DROP POLICY IF EXISTS "stores_delete_own" ON public.stores;

CREATE POLICY "stores_select_own" ON public.stores 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stores_insert_own" ON public.stores 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stores_update_own" ON public.stores 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "stores_delete_own" ON public.stores 
  FOR DELETE USING (auth.uid() = user_id);

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_charge ON public.subscriptions(shopify_charge_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_shop ON public.subscriptions(shopify_shop);
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON public.tests(status);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_shop ON public.stores(shop);
CREATE INDEX IF NOT EXISTS idx_stores_active ON public.stores(is_active) WHERE is_active = true;

-- Step 11: Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Also create a free subscription
  INSERT INTO public.subscriptions (user_id, plan, tests_limit, tests_used)
  VALUES (NEW.id, 'free', 1, 0)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 12: Add table comments
COMMENT ON TABLE public.stores IS 'Shopify store connections with OAuth tokens';
COMMENT ON COLUMN public.stores.access_token IS 'Shopify OAuth access token - should be encrypted in production';
COMMENT ON COLUMN public.stores.scopes IS 'Array of Shopify API scopes granted to this app';
COMMENT ON COLUMN public.profiles.technical_contact_email IS 'Technical contact email for system notifications';
COMMENT ON COLUMN public.profiles.monthly_revenue_goal IS 'Monthly revenue goal in dollars';
COMMENT ON COLUMN public.profiles.crm_synced_at IS 'Last time this profile was synced to CRM';
COMMENT ON COLUMN public.profiles.crm_contact_id IS 'External CRM contact ID (e.g., HubSpot, Salesforce)';

