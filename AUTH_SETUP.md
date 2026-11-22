# Gmail access and authentication

This is a private, **single-owner** app. Never remove server-side session checks or share the service-role key with the browser.

## Live access

Use https://linkedin-growth-os-two.vercel.app/login. Vercel deployment SSO protection has been disabled for this project; the app itself still verifies your Gmail identity using Supabase Auth.

The user's existing Supabase Auth account should be confirmed. Sign in with the approved Gmail by clicking **Email me a sign-in link**. There is no requirement to invite an account from the Supabase dashboard first if that user already exists.

## Required Supabase redirect URLs (one-time dashboard setup)

In [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/xpgskbmjfeuygzcigcxh/auth/url-configuration):

- **Site URL**: `https://linkedin-growth-os-two.vercel.app`
- **Redirect URLs**: add `https://linkedin-growth-os-two.vercel.app/auth/callback`
- For local development, also add `http://localhost:3000/auth/callback`.

Without this setting, Supabase may redirect to localhost after an email click, or the app's PKCE callback may fail even when the email account exists.

In Vercel Project Settings → Environment Variables, set `OWNER_EMAIL` to the approved Gmail address for Production, Preview, Development. This variable is server-side only and is now configured on the production project.

## Optional one-click Google sign-in

Google OAuth requires one-time credentials setup; merely owning a Gmail account does **not** enable Google OAuth.

1. Create OAuth client credentials on [Google Auth Platform](https://console.cloud.google.com/auth/overview). Request standard profile/email scopes.
2. Set the Google OAuth **Authorized redirect URI** to `https://xpgskbmjfeuygzcigcxh.supabase.co/auth/v1/callback`.
3. Add the Google Client ID and Client Secret under [Supabase Authentication → Providers → Google](https://supabase.com/dashboard/project/xpgskbmjfeuygzcigcxh/auth/providers).
4. Set Vercel `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` for the intended environments and redeploy. This exposes the Google button; without provider configuration, leave it unset/false.

Google sign-in remains restricted to the exact `OWNER_EMAIL` on the server.

## Known limitations

- Email magic links only work after the URL allow list is configured correctly and the Supabase email quota is not exhausted.
- Vercel currently has only Supabase public URL/key, owner email, and mock-publishing mode configured. The publishing worker and AI draft generation also require the server-side credentials described in `.env.example`.
- Do **not** put `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or `WORKER_SECRET` into `NEXT_PUBLIC_*` variables.
