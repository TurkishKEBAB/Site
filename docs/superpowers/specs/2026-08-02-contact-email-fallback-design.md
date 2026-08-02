# Contact Delivery and Admin Inbox Design

**Date:** 2026-08-02

## Problem

The public contact form currently depends on a valid CAPTCHA request and an
optional SMTP delivery path. The backend already creates a `contact_messages`
row before attempting SMTP, but SMTP exceptions are swallowed and the public
response always says the message was sent. The frontend also permits an empty
subject while the backend rejects it, and the admin message table does not
show the message body or provide a direct reply action.

The production API confirmed that a valid-shaped submission without a CAPTCHA
token is rejected before persistence. This is a security rejection, not proof
that SMTP is paid or unavailable. SMTP itself remains an optional notification
channel; the database-backed admin inbox is the reliable delivery path.

## Decision

Use the database-backed admin inbox as the source of truth for every valid,
CAPTCHA-approved contact submission. SMTP remains best-effort and optional:

- A missing SMTP username/password must not prevent the API from starting.
- A failed confirmation or admin notification must not remove the stored
  message or turn a successful submission into a server error.
- The public response reports that the message was received and includes a
  boolean indicating whether both SMTP notifications completed.
- The backend accepts an omitted/blank subject because the existing frontend
  treats subject as optional; the email service uses a fallback subject.
- CAPTCHA remains mandatory when enabled. It is never bypassed by the
  database fallback.

## Components and Data Flow

1. `ContactForm` validates the required name, email, and message fields and
   sends the CAPTCHA token when the protected widget supplies one.
2. `POST /api/v1/contact/` verifies CAPTCHA, creates and commits a
   `ContactMessage`, then attempts SMTP notifications if configured.
3. The endpoint returns the stored message id, a received-message text, and
   `email_sent` status. SMTP failure is logged with the message id.
4. Admin users retrieve messages through the existing authenticated contact
   endpoints. The admin table displays sender name, email, subject, full body,
   timestamp, read state, and a `mailto:` reply action with encoded subject and
   body.

No paid provider or new persistence service is required. Existing PostgreSQL
storage is sufficient. Gmail SMTP can remain configured with an app password,
but the admin inbox works when SMTP is intentionally absent.

## Error and Security Rules

- Invalid input and failed CAPTCHA are rejected before persistence.
- Database failures remain server errors; the fallback only applies after a
  successful database commit.
- SMTP credentials are never returned in API responses or rendered in the
  frontend.
- React escaping is relied on for displayed message content, and `mailto:`
  values are URL-encoded before rendering.
- Admin read/delete endpoints remain protected by `require_admin`.

## Verification

Backend tests will cover blank subjects, stored messages when SMTP is absent or
fails, the `email_sent` response value, and the existing admin list behavior.
Frontend tests will cover the optional-subject submission and admin rendering
of the full message/reply action. The backend contact suite, frontend contact
and admin tab suites, type-check, lint, and the repository quality gates will
be run before completion.
