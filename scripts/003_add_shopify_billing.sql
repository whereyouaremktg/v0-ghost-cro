-- Add Shopify billing columns to subscriptions table
-- Run this migration in Supabase SQL Editor

-- Add new columns for Shopify billing
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS shopify_charge_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_shop TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create indexes for Shopify charge lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_charge ON public.subscriptions(shopify_charge_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shopify_shop ON public.subscriptions(shopify_shop);

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.shopify_charge_id IS 'Shopify app subscription ID (gid://shopify/AppSubscription/...)';
COMMENT ON COLUMN public.subscriptions.shopify_shop IS 'Shopify store domain (e.g., mystore.myshopify.com)';
COMMENT ON COLUMN public.subscriptions.trial_ends_at IS 'When the trial period ends';
