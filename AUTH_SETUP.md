# Google Authentication Setup Guide

This guide will help you set up Google authentication for your Ghost CRO application.

## Prerequisites

- A Google account
- Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "Ghost CRO Auth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your new project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: Ghost CRO
   - User support email: Your email
   - Developer contact email: Your email
5. Click "Save and Continue"
6. Skip the "Scopes" section by clicking "Save and Continue"
7. Add test users if needed (your own email address)
8. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name it "Ghost CRO Web Client"
5. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://yourdomain.com/api/auth/callback/google` (for production, replace with your actual domain)
6. Click "Create"
7. You'll see your **Client ID** and **Client Secret** - keep these safe!

## Step 5: Set Up Environment Variables

1. In your project root, copy the example environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Open `.env.local` and fill in the values:
   \`\`\`env
   # Generate a secret with: openssl rand -base64 32
   AUTH_SECRET=your-generated-secret-here

   # From Google Cloud Console
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here

   # Your application URL
   NEXTAUTH_URL=http://localhost:3000
   \`\`\`

3. Generate the `AUTH_SECRET` by running:
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`
   Copy the output and paste it as your `AUTH_SECRET`

## Step 6: Restart Your Development Server

1. Stop your development server (Ctrl+C)
2. Restart it:
   \`\`\`bash
   npm run dev
   \`\`\`

## Step 7: Test Authentication

1. Open your browser and go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to `/dashboard` after successful login

## Protected Routes

All routes under `/dashboard` are now protected. If you try to access them without being logged in, you'll be redirected to the login page.

## Troubleshooting

### "Error: redirect_uri_mismatch"
- Make sure the redirect URI in your Google Cloud Console exactly matches `http://localhost:3000/api/auth/callback/google`
- Check for extra spaces or typos

### "Error: Missing AUTH_SECRET"
- Make sure you've created a `.env.local` file (not `.env.local.example`)
- Make sure you've generated and added an `AUTH_SECRET`
- Restart your development server after adding environment variables

### "Cannot GET /api/auth/signin"
- Make sure you've restarted your development server after adding the auth files
- Check that the API route file exists at `app/api/auth/[...nextauth]/route.ts`

## Production Deployment

When deploying to production:

1. Add your production URL to the "Authorized redirect URIs" in Google Cloud Console:
   - `https://yourdomain.com/api/auth/callback/google`

2. Update your environment variables in your hosting platform:
   - Set `NEXTAUTH_URL` to your production domain
   - Use the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Generate a new `AUTH_SECRET` for production

## Security Notes

- **Never commit your `.env.local` file to version control**
- Keep your `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` private
- Generate a different `AUTH_SECRET` for production
- Regularly rotate your secrets

## Need Help?

If you encounter any issues, check:
- [NextAuth.js Documentation](https://authjs.dev/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
