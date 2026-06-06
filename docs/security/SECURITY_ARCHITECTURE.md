# Security Architecture — VJIT IT Academic Hub AI

---

## Threat Model

| Threat | Mitigation |
|---|---|
| Credential stuffing | Account lockout after 5 fails + rate limiting |
| Session hijacking | Short-lived JWT (15m) + refresh token rotation |
| Privilege escalation | RBAC on every endpoint + resource ownership checks |
| SQL/NoSQL injection | Mongoose ODM + express-mongo-sanitize |
| XSS | xss-clean middleware + CSP headers via Helmet |
| CSRF | SameSite cookies + CORS whitelist |
| File upload malware | Type validation + S3 server-side encryption |
| Mass data exposure | Pagination limits + field projection in queries |
| Audit trail gap | Audit middleware on all mutations |
| Insecure direct object reference | Resource ownership verified before every action |

---

## Authentication Flow

```
1. POST /auth/login
   ├── Validate credentials
   ├── Check account active + not locked
   ├── bcrypt.compare password
   ├── Issue JWT (RS256, 15min) + Refresh token (7d)
   ├── Store refresh token (hashed) in DB
   └── Return tokens to client

2. Subsequent requests
   ├── Client sends: Authorization: Bearer <accessToken>
   ├── Server: jwt.verify(token, secret)
   ├── Server: check passwordChangedAt vs token iat
   └── Attach user to req.user

3. Token refresh
   ├── Client sends refresh token when 401 received
   ├── Server: verify refresh token + check DB (not revoked)
   ├── Rotate: revoke old, issue new refresh token
   └── Return new access + refresh tokens

4. Logout
   ├── Revoke refresh token in DB
   └── Client clears localStorage
```

---

## RBAC Permission Map

```
Routes → Middleware → Role Check

/api/v1/auth/*          → Public (with rate limiting)
/api/v1/cms/public      → Public
/api/v1/media/public    → Public

/api/v1/students/*      → authenticate → authorize('student')
/api/v1/faculty/*       → authenticate → authorize('faculty', 'hod')
/api/v1/hod/*           → authenticate → authorize('hod', 'admin')
/api/v1/admin/*         → authenticate → authorize('admin')
/api/v1/ai/*            → authenticate → authorize('faculty', 'hod', 'admin')
/api/v1/analytics/*     → authenticate → role-specific filtering

Resource ownership:
  Student can only read own submissions, vault, notifications
  Faculty can only read/write assignments for their assigned subjects
  HOD can read all within their department (read-only on evaluations)
```

---

## HTTP Security Headers (Helmet.js)

```
Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.vjit-it.ac.in data:; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## File Upload Security

```
Upload flow:
  1. Client requests presigned S3 POST URL from /media/upload-url
  2. Server validates: user authenticated, category allowed, mime type whitelisted
  3. Server generates presigned URL (expires: 5 min) with conditions:
     - Content-Type must match requested mime
     - Max size: 50MB
  4. Client uploads directly to S3 (no file touches our server)
  5. Client confirms upload → server registers CDN URL in DB

S3 bucket policy:
  - submissions bucket: PRIVATE (no public access)
  - assets bucket: PUBLIC READ (for CDN)
  - Server-side encryption: SSE-S3 (AES-256)
  - Versioning: enabled on submissions bucket

Allowed file types:
  application/pdf
  application/msword
  application/vnd.openxmlformats-officedocument.wordprocessingml.document
  image/jpeg
  image/png
  application/zip
```

---

## Data Encryption

| Layer | Method |
|---|---|
| Passwords | bcrypt, cost factor 12 |
| JWT | RS256 asymmetric signing |
| S3 files | AES-256 SSE-S3 |
| MongoDB Atlas | Encrypted at rest (Atlas managed) |
| TLS in transit | TLS 1.3 (CloudFront enforced) |

---

## Rate Limiting Strategy

```
Global:      300 req/min per authenticated token
Auth routes: 10 req/min per IP (login, refresh, forgot-password)
AI routes:   20 req/min per token
File upload: 10 req/min per token

On limit: 429 Too Many Requests
Headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
```

---

## Audit Trail

Every write operation logs:
```json
{
  "userId": "...",
  "role": "faculty",
  "action": "assignment.publish",
  "resource": "assignments",
  "resourceId": "...",
  "details": { "assignmentTitle": "..." },
  "ipAddress": "x.x.x.x",
  "userAgent": "...",
  "success": true,
  "timestamp": "2026-06-06T10:30:00Z"
}
```

Retention: 365 days (MongoDB TTL index)
Access: HOD (own department), Admin (full)

---

## Secrets Management

Development: `.env` file (gitignored)  
Production: **AWS Secrets Manager** + environment injection at deploy time

Never stored in code:
- JWT secrets
- MongoDB URI
- AWS credentials
- OpenRouter API key
- SMTP credentials
