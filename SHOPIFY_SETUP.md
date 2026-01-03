# Shopify OAuth Setup Guide

This guide will help you set up Shopify OAuth integration for Ghost CRO.

## Prerequisites

- A Shopify store (development store or production)
- Access to your Shopify Partners account

## Step 1: Create a Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Click "Apps" in the sidebar
3. Click "Create app"
4. Choose "Create app manually"
5. Fill in:
   - App name: `Ghost CRO`
   - App URL: Your app's URL (e.g., `https://yourdomain.com` or `http://localhost:3000` for development)
6. Click "Create app"

## Step 2: Configure OAuth Settings

1. In your app settings, go to "Client credentials"
2. Note your **Client ID** and **Client secret** (you'll need these for environment variables)

## Step 3: Configure Redirect URI

1. In your app settings, go to "App setup" or "OAuth"
2. Under "Allowed redirection URL(s)", add:
   - For development: `http://localhost:3000/api/auth/shopify/callback`
   - For production: `https://yourdomain.com/api/auth/shopify/callback`
3. **Important**: The redirect URI must match exactly, including the protocol (http/https) and port

## Step 4: Set Up Environment Variables

1. Create or update your `.env.local` file in the project root:

```env
# Shopify OAuth Credentials (from Step 2)
SHOPIFY_CLIENT_ID=your_client_id_here
SHOPIFY_CLIENT_SECRET=your_client_secret_here

# Your application URL
NEXTAUTH_URL=http://localhost:3000
# For production, use: NEXTAUTH_URL=https://yourdomain.com
```

2. Replace `your_client_id_here` and `your_client_secret_here` with your actual credentials from Step 2

## Step 5: Install App on Your Store

### For Development:

1. In your Shopify Partners dashboard, go to your app
2. Click "Test on development store"
3. Select a development store or create a new one
4. Authorize the app

### For Production:

1. Submit your app for review (if needed)
2. Install the app on your store from the Shopify App Store

## Step 6: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to your dashboard and click "Connect Shopify Store"

3. Enter your store name (e.g., `your-store.myshopify.com`)

4. You should be redirected to Shopify's authorization page

5. Click "Install" to authorize the app

6. You should be redirected back to your dashboard with the store connected

## Troubleshooting

### "Shopify OAuth is not configured"

- Make sure you've added `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` to your `.env.local` file
- Restart your development server after adding environment variables
- Check that there are no typos in the variable names

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in your Shopify app settings **exactly** matches:
  - Development: `http://localhost:3000/api/auth/shopify/callback`
  - Production: `https://yourdomain.com/api/auth/shopify/callback`
- Check for extra spaces, trailing slashes, or protocol mismatches (http vs https)

### "Invalid state" Error

- This usually means the OAuth flow was interrupted or the session expired
- Try connecting again
- Clear your browser cookies if the issue persists

### "Token exchange failed"

- Verify your `SHOPIFY_CLIENT_SECRET` is correct
- Make sure your app is properly installed on the store
- Check that the authorization code hasn't expired (codes expire quickly)

### App Not Showing in Store

- Make sure you've installed the app on your store
- For development stores, use "Test on development store" in Partners dashboard
- For production, the app must be published or in development mode

## Required Scopes

The app requests these read-only scopes (no write permissions):
- `read_analytics` - Access to store analytics data
- `read_customer_events` - Customer behavior tracking
- `read_orders` - Order data and conversion metrics
- `read_product_listings` - Product listing information
- `read_products` - Product details and inventory
- `read_reports` - Store performance reports
- `read_themes` - Theme information for checkout analysis
- `read_checkouts` - Abandoned checkout data (critical for CRO analysis)
- `read_shipping` - Shipping rates and zones
- `read_customers` - Customer segments and data

**Important**: These are all read-only scopes. Ghost CRO will never modify your store, products, orders, or customer data.

### Updating Scopes

If you've previously connected your store with older scopes, you'll need to re-authenticate:

1. **Disconnect the store** in Ghost CRO (Settings page)
2. **Reconnect** to grant the new permissions
3. The app will request all required scopes during re-authentication

**Note**: Existing users who connected before scope updates will need to disconnect and reconnect to grant the new permissions. The OAuth flow will automatically request all required scopes.

### Configuring Scopes in Shopify Partners Dashboard

1. Go to your app in [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Navigate to "App setup" → "Scopes"
3. Ensure all required scopes are enabled:
   - ✅ read_analytics
   - ✅ read_customer_events
   - ✅ read_orders
   - ✅ read_product_listings
   - ✅ read_products
   - ✅ read_reports
   - ✅ read_themes
   - ✅ read_checkouts
   - ✅ read_shipping
   - ✅ read_customers

**Important**: If you're updating scopes for an existing app, you may need to:
- Submit the app for review (if it's published)
- Or test on a development store to verify the new scopes work correctly

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your `SHOPIFY_CLIENT_SECRET` secure
- Use different credentials for development and production
- The OAuth flow uses state parameters for CSRF protection

## Production Deployment

When deploying to production:

1. Update your Shopify app's redirect URI to your production URL
2. Set environment variables in your hosting platform:
   - `SHOPIFY_CLIENT_ID`
   - `SHOPIFY_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your production URL)
3. Make sure your production URL uses HTTPS
4. Test the OAuth flow in production before going live

