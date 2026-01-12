-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'growth', 'scale'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  tests_limit INTEGER NOT NULL DEFAULT 0,
  tests_used INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  -- Shopify billing fields
  shopify_plan TEXT, -- 'Free', 'Growth', 'Scale'
  shopify_capped_amount NUMERIC, -- Monthly capped amount in USD
  shopify_charge_id TEXT, -- Shopify app subscription ID (gid://shopify/AppSubscription/...)
  shopify_shop TEXT, -- Shopify store domain (e.g., mystore.myshopify.com)
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tests table (checkout analyses)
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  overall_score INTEGER,
  friction_score INTEGER,
  trust_score INTEGER,
  clarity_score INTEGER,
  mobile_score INTEGER,
  results JSONB, -- Full AI analysis results
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "subscriptions_select_own" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Tests policies
CREATE POLICY "tests_select_own" ON public.tests 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tests_insert_own" ON public.tests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tests_update_own" ON public.tests 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tests_delete_own" ON public.tests 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_charge ON public.subscriptions(shopify_charge_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_shop ON public.subscriptions(shopify_shop);
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON public.tests(status);
