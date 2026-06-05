# Supabase Setup Guide

This project can use Supabase as the main backend for authentication, database records, file storage, and secure payment functions.

## 1. Create A Supabase Project

1. Create a Supabase project.
2. Copy the project URL and anon key.
3. Keep the service role key private. Do not expose it in frontend code.
4. Run `supabase-schema.sql` in the Supabase SQL editor.

## 2. Frontend Environment

For a future Next.js migration, use:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For the current static PWA, keep keys out of the repository and inject them at deploy time or add them manually in a local-only config file that is not committed.

## 3. Recommended Supabase Features

- Auth: email/password, magic link, and phone OTP where available.
- Database: PostgreSQL tables with Row Level Security enabled.
- Storage: gallery images, sermon thumbnails, downloadable documents.
- Edge Functions: M-Pesa STK Push, Daraja callbacks, PayPal webhooks, external SMS OTP.
- Realtime: event announcements and dashboard updates.

## 4. Payment Secrets

Store these in Supabase Edge Function secrets:

```env
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## 5. Launch Path

1. Connect Supabase Auth to the member portal.
2. Save prayer requests to `prayer_requests`.
3. Load sermons and events from Supabase tables.
4. Move gallery media into Supabase Storage.
5. Connect the giving form to the `mpesa-stk-push` Edge Function.
6. Show member giving history from the `payments` table.
