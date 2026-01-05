-- Add CRM fields to profiles table
-- Run this migration in Supabase SQL Editor

-- Add CRM-related fields to profiles
-- Note: Each column must be added separately for IF NOT EXISTS to work
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS technical_contact_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_revenue_goal NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS crm_synced_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS crm_contact_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.technical_contact_email IS 'Technical contact email for system notifications';
COMMENT ON COLUMN public.profiles.monthly_revenue_goal IS 'Monthly revenue goal in dollars';
COMMENT ON COLUMN public.profiles.crm_synced_at IS 'Last time this profile was synced to CRM';
COMMENT ON COLUMN public.profiles.crm_contact_id IS 'External CRM contact ID (e.g., HubSpot, Salesforce)';

