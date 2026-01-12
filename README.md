# Ghost CRO

**AI-Powered Conversion Rate Optimization for Shopify Stores**

Ghost CRO analyzes your Shopify store against category leaders, identifies friction points, and provides production-ready code fixes to improve conversion rates.

## Features

- 🤖 **AI-Powered Analysis** - Claude Sonnet 4 analyzes your store's checkout flow
- 📊 **Category Leader Benchmarks** - Compare against top-performing stores in your category
- 🔍 **Gap Analysis** - Identify specific areas where you fall short of category leaders
- 💻 **Production-Ready Code Fixes** - Get Shopify Liquid/CSS code you can deploy immediately
- 👥 **Persona Simulation** - See how different shopper personas experience your store
- 📈 **Revenue Opportunity** - Calculate potential revenue lift from fixes
- 🔄 **Async Job Architecture** - Fast, scalable analysis without timeouts

## Architecture

Ghost CRO is built as a Shopify App with:

- **Next.js 16** (App Router) for the frontend and API
- **Supabase** for database and authentication
- **Shopify Billing API** for subscriptions
- **Anthropic Claude** for AI analysis
- **Google Analytics 4** integration (optional)

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Shopify Partners account
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd v0-ghost-cro-1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for required environment variables.

### Database Setup

1. Create a Supabase project
2. Run `scripts/000_full_database_setup.sql` in Supabase SQL Editor
3. This creates all required tables, RLS policies, and indexes

### Shopify App Setup

1. Create an app in [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Configure OAuth redirect URI: `http://localhost:3000/api/auth/shopify/callback`
3. Set required scopes (all read-only)
4. Add `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` to `.env.local`

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## How It Works

1. **Connect Your Store** - OAuth with Shopify (tokens stored securely server-side)
2. **Run Analysis** - AI analyzes your checkout flow against category leaders
3. **Get Results** - Receive gap analysis and production-ready code fixes
4. **Deploy Fixes** - Copy-paste Shopify Liquid/CSS code into your theme

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── analyze/       # Analysis endpoints
│   │   ├── auth/          # OAuth callbacks
│   │   └── shopify/       # Shopify API routes
│   └── dashboard/         # Dashboard pages
├── components/            # React components
├── lib/                   # Core libraries
│   ├── analysis/          # Analysis logic
│   ├── benchmarks/        # Category leader benchmarks
│   ├── shopify/           # Shopify API client
│   └── supabase/          # Supabase clients
├── scripts/               # Database migration scripts
└── docs/                  # Documentation
```

## Key Features

### Async Analysis Jobs

Analysis runs asynchronously to prevent timeouts:

```typescript
// Create job
POST /api/analyze
// Returns: { jobId: "...", status: "pending" }

// Poll for results
GET /api/analyze/[id]/status
// Returns: { status: "completed", results: {...} }
```

### Category Leader Benchmarks

Compare your store against top performers:

- **Apparel:** 5 images/PDP, sticky ATC, 3 trust badges
- **Beauty:** 6 images/PDP, 4 express checkout options
- **Electronics:** 4 images/PDP, 5 trust badges

See `lib/benchmarks/category-leaders.ts` for all benchmarks.

### Production-Ready Code Fixes

Every issue includes:
- **Reasoning Trace** - Why this fix works
- **Production Code** - Copy-paste Shopify Liquid/CSS
- **Impact Estimate** - Expected conversion rate improvement

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Deployment

1. Set environment variables in your hosting platform
2. Run database migrations in Supabase
3. Configure Shopify app redirect URIs
4. Deploy to production (Vercel, etc.)

## Security

- ✅ All OAuth tokens stored server-side (never localStorage)
- ✅ Row Level Security (RLS) on all database tables
- ✅ Admin client only used in server-side routes
- ✅ CSRF protection on OAuth flows

## License

[Your License Here]

## Support

For setup help, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
