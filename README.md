# Embakasi Vosh Church PWA

A mobile-first Progressive Web App for Embakasi Vosh Church with offline caching, installable app manifest, responsive navigation, hero carousel, sermons, events, giving, prayer requests, gallery, and contact sections.

The current version is a static PWA prototype. The recommended production platform architecture is documented in `PLATFORM_ARCHITECTURE.md`, with Supabase setup details in `SUPABASE_SETUP.md`.

## Supabase

Supabase is the recommended backend path for this project:

- Supabase Auth for member registration, login, OTP, and sessions.
- Supabase PostgreSQL for users, sermons, events, giving, prayer requests, and audit logs.
- Supabase Storage for gallery images and sermon media.
- Supabase Edge Functions for M-Pesa Daraja, PayPal, and secure provider callbacks.

Start with `SUPABASE_SETUP.md`, then run `supabase-schema.sql` in the Supabase SQL editor.

The member portal is wired to:

```text
https://dwjodjrwoubuyefpxwpm.supabase.co
```

Registration creates a Supabase Auth user and, after the SQL trigger is installed, a matching `profiles` row with name, email, and phone. Registration and login activity are recorded in `audit_logs`.

## Run locally

Use any static server from this folder. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

Service workers require a local server or HTTPS, so opening `index.html` directly will show the site but will not fully enable offline PWA behavior.

## Hash routes

The app uses hash routing so it can be hosted on static servers without rewrite rules:

- `#/home`
- `#/about`
- `#/ministries`
- `#/sermons`
- `#/events`
- `#/portal`
- `#/login`
- `#/signup`
- `#/forgot-password`
- `#/reset-password`
- `#/dashboard`
- `#/admin`
- `#/gallery`
- `#/give`
- `#/prayer`
- `#/contact`
