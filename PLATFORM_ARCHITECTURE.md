# Embakasi Vosh Church Platform Architecture

This document defines the recommended production architecture for evolving the current PWA into a full church platform with authentication, payments, content management, and member dashboards.

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

### Backend API

Primary responsibility: secure business logic and integrations.

- Authentication: register, login, OTP verification, refresh tokens
- Payments: M-Pesa STK Push, C2B callbacks, PayPal/card preparation
- User management: profiles, roles, permissions
- Church content management: sermons, events, ministries, gallery
- Audit logs: security events and admin activity tracking

Recommended stack:

- Node.js with NestJS
- TypeScript
- JWT access tokens plus refresh tokens
- Modular services for auth, payments, content, users, and audit logs

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

- PostgreSQL as the primary relational database
- Redis for OTP expiry, sessions, rate limiting, and short-lived cache

### External Services

Primary responsibility: secure integration with third-party providers.

- Safaricom Daraja API for M-Pesa
- Africa's Talking or Twilio for SMS OTP
- SendGrid, AWS SES, or similar for email OTP
- Vercel or Netlify for frontend hosting
- Render, Railway, Fly.io, or AWS for backend hosting
- CDN-backed image and asset hosting

## 2. Authentication And OTP Flow

1. User registers with phone/email and password.
2. Backend hashes the password and creates a user record.
3. User logs in with phone/email and password.
4. Backend generates a secure OTP using a crypto-safe random generator.
5. OTP is stored in Redis with a short expiry and logged in PostgreSQL for auditing.
6. OTP is sent by SMS or email.
7. User submits OTP.
8. Backend verifies OTP, clears it, writes an audit log, and issues JWT access and refresh tokens.

Security requirements:

- Hash passwords with Argon2 or bcrypt.
- Rate-limit OTP and login attempts.
- Store OTPs hashed, not as plain text.
- Use short OTP expiry windows.
- Rotate refresh tokens.
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
2. Backend creates a pending payment record.
3. Backend sends STK Push request to Daraja.
4. Daraja calls the backend callback URL.
5. Backend verifies callback, updates payment status, and writes an audit log.
6. Frontend fetches the updated payment result for the member dashboard.

### PayPal And Cards

Keep this as a secondary payment path for international giving.

- Create payment intent/order from backend.
- Confirm payment through provider callback.
- Store payment record with provider reference.
- Show giving history in the dashboard.

## 4. Suggested Backend Modules

- `AuthModule`: registration, login, OTP, JWT, refresh tokens
- `UsersModule`: profiles, roles, permissions
- `PaymentsModule`: M-Pesa, PayPal, payment records, callbacks
- `ContentModule`: sermons, events, ministries, gallery
- `PrayerModule`: prayer requests and moderation workflow
- `AuditModule`: security and admin activity tracking
- `NotificationsModule`: SMS, email, and push notification readiness

## 5. Deployment Direction

Frontend:

- Deploy on Vercel.
- Use hash routes or Next.js routes depending on the migration phase.
- Keep PWA manifest and service worker enabled over HTTPS.

Backend:

- Deploy NestJS API separately.
- Keep secrets in environment variables.
- Use HTTPS-only callbacks for M-Pesa.

Database:

- Managed PostgreSQL.
- Managed Redis.
- Daily backups.
- Separate production and staging environments.

