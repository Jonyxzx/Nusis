# Backend API Reference

Base URL: `${BASE_URL}` (from `.env`, default likely `http://localhost:4000`)

Auth: Cookies (Google OAuth). Most endpoints are open in this dev setup unless you add middleware.

## Health
- GET `/health`
  - 200 OK `{ status: "ok", uptime: <number> }`

- GET `/api/me`
  - 200 OK `{ user: {...} }` when authenticated
  - 401 `{ error: "Not authenticated" }`

## Auth (Google OAuth)
- GET `/auth/google` → redirect to Google login
- GET `/auth/google/callback` → handles provider callback, redirects to `FRONTEND_URL`
- POST `/auth/logout` → logs out and clears session

## Recipients
Base: `/v1/recipients`

- GET `/`
  - 200 OK `[ { _id, name, email, createdAt, updatedAt } ]`

- POST `/`
  - Body: `{ name: string, email: string }`
  - 201 Created `{ _id, name, email, createdAt, updatedAt }`
  - 400 on validation failure

- GET `/:id`
  - 200 OK `{ _id, name, email, createdAt, updatedAt }`
  - 404 if not found

- PUT `/:id`
  - Body: `{ name?: string, email?: string }`
  - 200 OK `{ _id, name, email, createdAt, updatedAt }`
  - 400 invalid id/body, 404 if not found

- DELETE `/:id`
  - 204 No Content
  - 404 if not found

Sample create:
```
POST /v1/recipients
Content-Type: application/json

{ "name": "Jane Doe", "email": "jane@example.com" }
```

## Email Templates
Base: `/v1/emails`

- GET `/`
  - 200 OK `[ { _id, name?, subject, body, fromName?, fromEmail?, createdAt, updatedAt } ]`

- POST `/`
  - Body: `{ name: string, subject: string, body: string, fromName?: string, fromEmail?: string }`
  - 201 Created `{ _id, ... }`
  - 400 on validation failure
  - 409 when `name` conflicts with an existing template (case-insensitive)

- GET `/:id`
  - 200 OK `{ _id, ... }`
  - 404 if not found

- PUT `/:id`
  - Body: `{ name?, subject?, body?, fromName?, fromEmail? }`
  - 200 OK `{ _id, ... }`
  - 400 invalid id/body, 404 if not found
  - 409 when updating `name` to an existing value (case-insensitive)

- DELETE `/:id`
  - 204 No Content

Sample create:
```
POST /v1/emails
Content-Type: application/json

{
  "name": "Invitation 2025",
  "subject": "Invitation to NUSIS 2025 – TeamNUS Shooting",
  "body": "<p>Hello {{recipient}}</p>",
  "fromName": "TeamNUS",
  "fromEmail": "teamnus@example.com"
}
```

## Email Send (Service)
This project includes a service (`src/service/emailService.ts`) with:
- `sendTemplatedEmail(to, subject, templateName, variables)`
- `sendNusisInvitation(to, { recipientSchool, signoffName, signoffRole, signoffOrg })`

You can test via the CLI:
```
npm run invite:dry -- --school "Bukit Batok Secondary School" --name "Test (Mr.)" --role "Head of Test" --org "NUSIS 2025 Organising Committee"
```

## Email Logs
Base: `/v1/logs`

- GET `/`
  - Query: `?limit=50`
  - 200 OK `[ { _id, subject, bodyPreview?, recipients, perRecipient?, recipientCount, successCount, failedCount, startedAt, completedAt?, durationMs?, meta?, createdAt, updatedAt } ]`

- GET `/:id`
  - 200 OK `{ ... }`
  - 404 if not found

- POST `/`
  - Body: `{ templateName: string, subject: string, recipients: [{ email, name? }], bodyPreview?, perRecipient?, recipientCount?, successCount?, failedCount?, startedAt?, completedAt?, durationMs?, meta? }`
  - 201 Created `{ _id, ... }`

Sample create:
```
POST /v1/logs
Content-Type: application/json

{
  "templateName": "nusis-invitation-2025",
  "subject": "Invitation to NUSIS 2025 – TeamNUS Shooting",
  "bodyPreview": "Dear Teachers-in-Charge...",
  "recipients": [ { "email": "teacher@example.com", "name": "Mr Tan" } ],
  "perRecipient": [ { "email": "teacher@example.com", "status": "sent", "messageId": "<id>", "sentAt": "2025-10-16T08:00:00Z" } ],
  "startedAt": "2025-10-16T08:00:00Z",
  "completedAt": "2025-10-16T08:00:03Z",
  "durationMs": 3000,
  "meta": { "campaign": "NUSIS 2025" }
}
```

## Notes
- Ensure `.env` contains: `BASE_URL`, `FRONTEND_URL`, `SESSION_SECRET`, `MONGODB_URI` (and optional `MONGODB_DB_NAME`).
- Email sending requires `GMAIL_USER` and `GMAIL_PASS`.
- CORS is configured to `FRONTEND_URL` and credentials.
