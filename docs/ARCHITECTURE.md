# Ghost CRO Architecture

**Production MVP Architecture** - Shopify App for Conversion Rate Optimization

## Overview

Ghost CRO is a Shopify App that analyzes stores for Conversion Rate Optimization (CRO). It uses AI-powered analysis to identify friction points, compare stores against category leaders, and provide actionable code fixes.

## Core Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Billing:** Shopify Billing API (GraphQL)
- **AI:** Anthropic Claude (Sonnet 4)
- **Analytics:** Google Analytics 4 (OAuth)

### Key Components

#### 1. Authentication & Authorization

- **User Auth:** Supabase Auth (email/password, OAuth)
- **Shopify OAuth:** Server-side token storage in Supabase `stores` table
- **Security:** No localStorage for tokens - all tokens stored server-side in database
- **RLS:** Row Level Security enabled on all tables

#### 2. Billing System

- **Provider:** Shopify Billing API (GraphQL `appSubscriptionCreate`)
- **Plans:** Free, Growth, Scale
- **Storage:** Subscription data in `subscriptions` table with Shopify fields:
  - `shopify_plan` (Free, Growth, Scale)
  - `shopify_capped_amount` (monthly USD)
  - `shopify_charge_id` (Shopify subscription ID)
  - `shopify_shop` (store domain)

#### 3. Analysis Engine

- **Async Job Architecture:** Analysis runs asynchronously via job queue
- **Job Storage:** `tests` table with status (`pending`, `running`, `completed`, `failed`)
- **Polling:** `GET /api/analyze/[id]/status` endpoint for job status
- **AI Analysis:** Two-stage Claude analysis:
  1. Structured store analysis (product page, checkout, technical)
  2. Persona-based friction point identification

#### 4. Benchmark Engine

- **Category Leaders:** Gold standard benchmarks for categories (Apparel, Beauty, Electronics, etc.)
- **Gap Analysis:** Compares store metrics against category leaders
- **Location:** `lib/benchmarks/category-leaders.ts`
- **Integration:** Used in store analysis prompts to identify gaps

## Database Schema

### Tables

#### `profiles`
- Extends `auth.users`
- User profile data (email, name, company, CRM sync fields)

#### `subscriptions`
- User subscription data
- Shopify billing fields (no Stripe)
- Plan limits and usage tracking

#### `tests`
- Analysis job storage
- Status tracking (`pending`, `running`, `completed`, `failed`)
- Results stored as JSONB

#### `stores`
- Shopify OAuth tokens
- Store connection data
- Access tokens (should be encrypted in production)

#### `ga4_connections`
- Google Analytics 4 OAuth tokens
- Property selection and refresh tokens

## API Routes

### Analysis
- `POST /api/analyze` - Create analysis job (returns jobId immediately)
- `GET /api/analyze/[id]/status` - Poll job status

### Authentication
- `GET /api/auth/shopify/callback` - Shopify OAuth callback
- `GET /api/auth/google-analytics/callback` - GA4 OAuth callback

### Billing
- `POST /api/shopify/billing/create` - Create Shopify subscription
- `GET /api/shopify/billing/callback` - Subscription approval callback
- `POST /api/shopify/billing/status` - Get subscription status
- `POST /api/shopify/billing/cancel` - Cancel subscription

## Setup Guides

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Shopify
SHOPIFY_CLIENT_ID=your-shopify-client-id
SHOPIFY_CLIENT_SECRET=your-shopify-client-secret

# AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google Analytics (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

### Database Setup

Run `scripts/000_full_database_setup.sql` in Supabase SQL Editor to create all tables, RLS policies, and indexes.

### Shopify App Setup

1. Create app in [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Configure OAuth redirect URI: `https://yourdomain.com/api/auth/shopify/callback`
3. Set required scopes (read-only):
   - `read_analytics`, `read_orders`, `read_products`, `read_checkouts`, `read_shipping`, etc.

### Google Analytics Setup (Optional)

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure redirect URI: `https://yourdomain.com/api/auth/google-analytics/callback`
3. Enable Google Analytics Data API

## Security Best Practices

1. **Token Storage:** All OAuth tokens stored server-side in Supabase (never localStorage)
2. **RLS:** Row Level Security enabled on all tables
3. **Admin Client:** Only used in server-side API routes
4. **Environment Variables:** Never commit `.env.local` to version control
5. **Token Encryption:** Consider encrypting tokens in production (TODO)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

1. Set all environment variables in your hosting platform (Vercel, etc.)
2. Run database migrations in Supabase SQL Editor
3. Configure Shopify app redirect URIs
4. Deploy to production

## Architecture Decisions

### Why Async Jobs?

- Analysis can take 30-60 seconds
- Prevents timeout issues
- Better UX (immediate feedback, polling for results)
- Scalable architecture

### Why Shopify Billing Only?

- Native Shopify integration
- No external payment processor needed
- Automatic subscription management
- Better merchant experience

### Why Category Leaders Benchmark?

- More actionable than generic benchmarks
- Category-specific insights
- Clear gap analysis
- Competitive positioning

## Future Enhancements

- [ ] Token encryption for production
- [ ] Auto-detect store category
- [ ] Real-time analysis progress updates (WebSockets)
- [ ] Batch analysis jobs
- [ ] Analysis history and trends
