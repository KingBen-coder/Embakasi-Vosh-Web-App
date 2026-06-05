# Embakasi Vosh Church Platform Architecture

This document defines the recommended production architecture for evolving the current PWA into a full church platform with authentication, payments, content management, and member dashboards.

The recommended backend path for this project is Supabase-first. Supabase provides PostgreSQL, Auth, Row Level Security, Storage, realtime subscriptions, and Edge Functions, which allows the church platform to launch faster while still keeping a clean upgrade path for custom services later.

## 1. High-Level Layers

### Frontend PWA

Primary responsibility: church member and visitor experience.

- Member registration and login
- OTP verification flow
- Sermons, events, gallery, prayer requests, and giving UI
- Member dashboard for sermons, events, giving history, and profile
- Offline support and installable mobile app experience

Recommended stack:

- Next.js with React
- Tailwind CSS
- next-pwa or a Workbox-powered service worker
- TanStack Query for API state management

### Backend API And Supabase

Primary responsibility: secure business logic, data access, and integrations.

Supabase responsibilities:

- Authentication: register, login, email OTP, phone OTP where enabled, password reset
- Database access through PostgreSQL tables and Row Level Security policies
- User profile management
- Church content management: sermons, events, ministries, gallery
- Storage buckets for sermon thumbnails, gallery images, and documents
- Realtime updates for events, announcements, and dashboard data
- Audit logs for security events and admin activity

Edge Function responsibilities:

- M-Pesa STK Push initiation
- M-Pesa C2B and STK callback handling
- PayPal/card payment webhooks
- SMS OTP provider integration when Supabase phone auth is not enough
- Server-only secrets and provider credentials

Recommended stack:

- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Edge Functions
- TypeScript for Edge Functions
- Optional NestJS API later only if the platform outgrows Supabase Edge Functions

### Database

Primary responsibility: reliable storage and queryable church records.

- Users
- OTP logs
- Payments
- Sermons
- Events
- Ministries
- Prayer requests
- Audit logs

Recommended stack:

- Supabase PostgreSQL as the primary relational database
- Supabase Auth users as the source of login identity
- Row Level Security for member/admin access control
- Optional Redis later for advanced rate limiting and high-volume queues

### External Services

Primary responsibility: secure integration with third-party providers.

- Safaricom Daraja API for M-Pesa
- Africa's Talking or Twilio for SMS OTP
- SendGrid, AWS SES, or similar for email OTP
- Supabase hosted Postgres, Auth, Storage, and Edge Functions
- Vercel or Netlify for frontend hosting
- CDN-backed image and asset hosting

## 2. Authentication And OTP Flow

1. User registers with phone/email and password using Supabase Auth.
2. Supabase creates the auth identity and sends verification where configured.
3. A `profiles` row is created for church-specific member details.
4. User logs in with email/phone and password.
5. Supabase issues a secure authenticated session.
6. Optional OTP or magic-link verification is handled through Supabase Auth or an Edge Function plus SMS provider.
7. The app uses the Supabase session to read/write allowed data through RLS policies.
8. Login and verification events are written to `audit_logs`.

Security requirements:

- Let Supabase Auth manage password hashing and session security.
- Enable email/phone confirmation before privileged access.
- Keep Row Level Security enabled on all member tables.
- Rate-limit Edge Functions that trigger OTP or payment requests.
- Store custom OTPs hashed if an external OTP provider is used.
- Record login, OTP, and payment events in audit logs.

## 3. Payment Integration

### M-Pesa

Use Safaricom Daraja API.

Core features:

- STK Push for member-initiated giving
- C2B for customer-to-business payment flows
- Payment callbacks and webhook verification
- Payment status reconciliation
- Giving categories: tithes, offerings, building fund, missions, and events

Suggested payment flow:

1. Member enters amount, phone number, and giving category.
2. Supabase Edge Function creates a pending payment record.
3. Edge Function sends STK Push request to Daraja.
4. Daraja calls the Edge Function callback URL.
5. Edge Function verifies callback, updates payment status, and writes an audit log.
6. Frontend fetches the updated payment result for the member dashboard.

### PayPal And Cards

Keep this as a secondary payment path for international giving.

- Create payment intent/order from backend.
- Confirm payment through provider callback.
- Store payment record with provider reference.
- Show giving history in the dashboard.

## 4. Suggested Supabase Tables And Functions

Tables:

- `profiles`: church member profile linked to `auth.users`
- `sermons`: sermon metadata, media URLs, preacher, date, Bible verse
- `events`: services, fellowships, conferences, youth meetings, prayer nights
- `payments`: tithes, offerings, building fund, missions, events
- `prayer_requests`: submitted requests with anonymous option
- `ministries`: ministry content and contact points
- `audit_logs`: security and admin activity tracking

Edge Functions:

- `mpesa-stk-push`: starts an M-Pesa STK Push request
- `mpesa-callback`: receives and verifies Daraja callbacks
- `paypal-webhook`: records international giving confirmations
- `send-otp`: optional SMS/email OTP provider bridge
- `admin-content`: optional server-side content moderation workflow

## 5. Deployment Direction

Frontend:

- Deploy on Vercel.
- Use hash routes or Next.js routes depending on the migration phase.
- Keep PWA manifest and service worker enabled over HTTPS.

Backend:

- Use Supabase Edge Functions for payment and OTP provider integrations.
- Keep secrets in Supabase project secrets.
- Use HTTPS-only callbacks for M-Pesa.
- Add a separate NestJS API later only if custom backend complexity grows.

Database:

- Supabase managed PostgreSQL.
- Supabase Storage buckets for media.
- Daily backups.
- Separate production and staging environments.
