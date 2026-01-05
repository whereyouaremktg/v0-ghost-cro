# CRM Integration Guide

Ghost CRO automatically captures and syncs user data to your CRM system.

## 📊 Data Captured

When a user completes onboarding, we capture:

- **Email** (from auth.users)
- **Full Name** (from signup)
- **Company Name** (optional, from profile)
- **Phone Number** (optional, from onboarding)
- **Technical Contact Email** (from onboarding)
- **Monthly Revenue Goal** (from onboarding)
- **Store URL** (from Shopify connection)
- **Connection Date** (when Shopify was connected)

## 🔧 Setup

### Option 1: Webhook Integration (Recommended)

1. **Set Environment Variables** in Vercel:
   ```bash
   CRM_WEBHOOK_URL=https://your-crm.com/api/webhooks/ghost
   CRM_WEBHOOK_SECRET=your-secret-key  # Optional, for authentication
   ```

2. **Webhook Payload Format**:
   ```json
   {
     "event": "user.created" | "store.connected" | "onboarding.completed",
     "contact": {
       "email": "user@example.com",
       "full_name": "John Doe",
       "company_name": "Acme Inc",
       "phone": "+1 (555) 123-4567",
       "technical_contact_email": "dev@acme.com",
       "monthly_revenue_goal": 100000,
       "store_url": "acme.myshopify.com",
       "connected_at": "2024-01-15T10:30:00Z"
     },
     "metadata": {
       "userId": "uuid-here",
       "syncedAt": "2024-01-15T10:30:00Z"
     }
   }
   ```

3. **Your CRM endpoint should**:
   - Accept POST requests
   - Return 200 OK on success
   - Handle errors gracefully (we log but don't fail)

### Option 2: Manual Sync API

Call the sync endpoint manually:

```bash
POST /api/crm/sync
Content-Type: application/json

{
  "userId": "user-uuid-here"
}
```

### Option 3: Direct Database Access

Query Supabase directly:

```sql
SELECT 
  p.email,
  p.full_name,
  p.company_name,
  p.phone,
  p.technical_contact_email,
  p.monthly_revenue_goal,
  s.shop as store_url,
  s.connected_at
FROM profiles p
LEFT JOIN stores s ON s.user_id = p.id AND s.is_active = true
WHERE p.crm_synced_at IS NULL
  OR p.crm_synced_at < p.updated_at;
```

## 🔄 Sync Triggers

CRM sync happens automatically when:

1. **Store Connected** - After Shopify OAuth completes
2. **Onboarding Completed** - When user finishes setup wizard
3. **Manual Trigger** - Via `/api/crm/sync` endpoint

## 📝 Database Fields

Added to `profiles` table:

- `phone` - User phone number
- `technical_contact_email` - Technical contact
- `monthly_revenue_goal` - Revenue goal in dollars
- `crm_synced_at` - Last sync timestamp
- `crm_contact_id` - External CRM contact ID (for tracking)

## 🚀 Popular CRM Integrations

### HubSpot
```bash
CRM_WEBHOOK_URL=https://api.hubapi.com/contacts/v1/contact
CRM_WEBHOOK_SECRET=your-hubspot-api-key
```

### Salesforce
```bash
CRM_WEBHOOK_URL=https://your-instance.salesforce.com/services/data/v58.0/sobjects/Contact
CRM_WEBHOOK_SECRET=your-salesforce-token
```

### Pipedrive
```bash
CRM_WEBHOOK_URL=https://api.pipedrive.com/v1/persons
CRM_WEBHOOK_SECRET=your-pipedrive-api-token
```

## 🔐 Security

- Webhook requests include optional `Authorization: Bearer <secret>` header
- All syncs are logged but failures don't break the app
- User data is only synced after explicit consent (onboarding completion)

## 📊 Migration

Run this SQL to add CRM fields:

**File:** `scripts/005_add_crm_fields.sql`

Or use the consolidated script:

**File:** `scripts/000_full_database_setup.sql` (includes CRM fields)

