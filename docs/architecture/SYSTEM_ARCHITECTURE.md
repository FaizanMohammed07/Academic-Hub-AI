# System Architecture — VJIT IT Academic Hub AI

## Architecture Pattern: Modular Monolith

The system uses a **Modular Monolith** architecture — a single deployable Node.js process organized into strongly-bounded feature modules. Each module owns its routes, controllers, services, models, and validators. Modules communicate through a shared internal event bus, never by reaching into each other's internals.

This gives us:
- Simple deployment (one process, one container)
- Strong internal boundaries for future microservice extraction
- Easy developer onboarding
- No distributed systems complexity in Phase 1

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENTS (Browser)                             │
│                                                                      │
│   Public Site   Student Panel   Faculty Panel   HOD   Admin Panel   │
│       └───────────────────────────────────────────────┘              │
│                              │                                       │
│                    React 18 SPA (Vite)                               │
│              TailwindCSS · ShadCN · Framer Motion                   │
│                    React Query · Zustand                             │
└──────────────────────────────┬───────────────────────────────────────┘
                               │  HTTPS (TLS 1.3)
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                    AWS CloudFront (CDN)                              │
│            Static Assets · Image Optimization · Edge Cache           │
└──────────────────┬──────────────────────────────┬────────────────────┘
                   │                              │
          API Requests                     Static Files
                   │                              │
┌──────────────────▼───────────────┐    ┌─────────▼──────────┐
│      AWS EC2 — App Server        │    │     AWS S3         │
│                                  │    │  (file storage)    │
│  ┌────────────────────────────┐  │    │  Assignments       │
│  │   Express.js API Gateway   │  │    │  Observations      │
│  │   (Port 5000)              │  │    │  Certificates      │
│  │                            │  │    │  Gallery Media     │
│  │  Rate Limiter · Helmet     │  │    │  Faculty Photos    │
│  │  CORS · Morgan Logger      │  │    │  HOD Photos        │
│  │  JWT Middleware · RBAC     │  │    └────────────────────┘
│  └────────────┬───────────────┘  │
│               │                  │    ┌────────────────────┐
│  ┌────────────▼───────────────┐  │    │  OpenRouter API    │
│  │      Module Router         │  │    │  (AI Engine)       │
│  │                            │  │    │  Plagiarism        │
│  │  /auth   /students         │  │    │  Q-Generation      │
│  │  /faculty /assignments     │◄─┼────│  AI Detection      │
│  │  /submissions /analytics   │  │    │  Quality Score     │
│  │  /notifications /cms       │  │    └────────────────────┘
│  │  /quizzes /vault /admin    │  │
│  │  /audit  /timetable /ai    │  │    ┌────────────────────┐
│  └────────────┬───────────────┘  │    │  Email Service     │
│               │                  │    │  (AWS SES /        │
│  ┌────────────▼───────────────┐  │    │   Nodemailer)      │
│  │   Internal Event Bus        │  │    └────────────────────┘
│  │   (EventEmitter / future   │  │
│  │    Bull Queue)             │  │
│  └────────────┬───────────────┘  │
│               │                  │
└───────────────┼──────────────────┘
                │
┌───────────────▼──────────────────┐
│         MongoDB Atlas             │
│         (M10+ Cluster)            │
│                                  │
│  Collections:                    │
│  users · students · faculty      │
│  assignments · submissions       │
│  observations · quizzes          │
│  subjects · semesters            │
│  analytics · notifications       │
│  vault · cms · audit · timetable │
└──────────────────────────────────┘
```

---

## Backend Module Dependency Map

```
app.js (Entry Point)
  │
  ├── shared/config          ← env vars, constants
  ├── shared/database        ← MongoDB connection
  ├── shared/middleware      ← auth, rbac, rateLimit, logger
  ├── shared/errors          ← AppError, ErrorHandler
  └── shared/events          ← internal EventBus
       │
       ├── modules/auth           ← login, logout, refresh, password reset
       ├── modules/users          ← shared user model, profile
       ├── modules/students       ← student-specific data, enrollment
       ├── modules/faculty        ← faculty profiles, subject mapping
       ├── modules/semesters      ← semester lifecycle
       ├── modules/subjects       ← subject catalog
       ├── modules/timetable      ← schedule management
       │
       ├── modules/assignments    ← CRUD, anti-copy distribution
       ├── modules/submissions    ← upload, status, resubmission
       ├── modules/observations   ← lab records
       ├── modules/quizzes        ← quiz engine
       │
       ├── modules/ai             ← OpenRouter integration, prompts
       ├── modules/anti-copy      ← topic pool, distribution algorithm
       │
       ├── modules/analytics      ← aggregation pipelines
       ├── modules/notifications  ← in-app, email, push
       ├── modules/vault          ← student academic portfolio
       │
       ├── modules/cms            ← public website content
       ├── modules/media          ← S3 upload/delete
       ├── modules/audit          ← action logging
       └── modules/admin          ← system config, AI config
```

---

## Frontend Module Map

```
client/src/
  ├── router/                    ← React Router v6, protected routes
  ├── store/                     ← Zustand auth store, global state
  ├── services/api/              ← Axios instances, interceptors
  │
  ├── shared/
  │   ├── components/            ← Button, Modal, Table, Badge, etc.
  │   ├── hooks/                 ← useAuth, useNotifications, useDebounce
  │   ├── utils/                 ← date, format, validation helpers
  │   └── context/               ← ThemeContext, NotificationContext
  │
  └── modules/
      ├── public/                ← Department website (no auth)
      ├── auth/                  ← Login page (role-aware)
      ├── student/               ← Student panel + sub-pages
      ├── faculty/               ← Faculty panel + sub-pages
      ├── hod/                   ← HOD panel + sub-pages
      └── admin/                 ← Admin panel + sub-pages
```

---

## AWS Infrastructure Architecture

```
Internet
    │
    ▼
Route 53 (DNS)
    │
    ▼
CloudFront Distribution
    ├── /api/* → EC2 Origin (ALB)
    └── /* → S3 Static Website Bucket
         (React SPA build)
    │
    ▼
Application Load Balancer (ALB)
    │
    ▼
EC2 Auto Scaling Group
    ├── t3.medium (Phase 1: 1 instance)
    └── t3.large (Scale: 2-4 instances)
         │
         ├── Node.js App (PM2 cluster mode)
         │    Port 5000
         │
         └── Security Group: Port 5000 open to ALB only
    │
    ├── MongoDB Atlas (M10 cluster, Mumbai region)
    │    VPC Peering with EC2 VPC
    │
    └── S3 Buckets
         ├── vjit-it-assets (public: media, logos, photos)
         ├── vjit-it-submissions (private: student uploads)
         └── vjit-it-static (public: React SPA)
```

---

## Security Layers

```
Request Flow:
Browser → CloudFront (HTTPS) → ALB → EC2

Layer 1: Network
  - VPC with private/public subnets
  - Security Groups: DB only accessible from EC2
  - CloudFront WAF rules

Layer 2: Application
  - Helmet.js (CSP, HSTS, X-Frame-Options)
  - CORS whitelist
  - Rate limiting (express-rate-limit)
  - Request size limits

Layer 3: Authentication
  - JWT RS256 (asymmetric signing)
  - Refresh token rotation
  - Account lockout after 5 failed attempts

Layer 4: Authorization
  - RBAC middleware on every protected route
  - Resource ownership checks (student can only see own data)

Layer 5: Data
  - MongoDB Atlas encryption at rest
  - S3 SSE-S3 encryption
  - Mongoose schema validation
  - Input sanitization (express-mongo-sanitize, xss-clean)

Layer 6: Audit
  - Every mutation logged to audit collection
  - IP, user, action, timestamp, affected resource
```

---

## AI Architecture

```
OpenRouter API Integration

Faculty Action                Student Action
     │                             │
     ▼                             ▼
AI Module Routes            Submission Saved to S3
     │                             │
     ▼                             ▼
AI Service Layer            Analysis Trigger (EventBus)
     │                             │
     ├── Prompt Builder            ▼
     │   (module: ai/prompts)  AI Analysis Pipeline
     │                             │
     ├── Model Router          ┌───┴───────────────────────┐
     │   (OpenRouter)          │ 1. Extract text from file  │
     │                         │ 2. Cross-submission check  │
     ├── Response Parser       │ 3. AI content detection    │
     │   (ai/parsers)          │ 4. Quality analysis        │
     │                         │ 5. Relevance check         │
     └── Result Store          │ 6. Score aggregation       │
         (submissions.aiResult)└───────────────────────────┘
                                        │
                              Analysis Result Saved
                                        │
                              ┌─────────┴─────────┐
                              │ Faculty sees full  │
                              │ Student sees brief │
                              └───────────────────┘
```

---

## Anti-Copy Distribution Algorithm

```
Input:
  - Topic Pool T = [T1, T2, T3, T4, ...Tn]
  - Student List S = [S1, S2, ...Sm] (sorted by roll number)
  - Seed = Assignment ID (deterministic)

Algorithm: Seeded Shuffled Rotation

1. Sort students by roll number ascending
2. Shuffle topic pool using seed = SHA256(assignmentId)
3. For each student Si:
   a. topicIndex = (i + seed_offset) % totalTopics
   b. Ensure Si.topicIndex ≠ Si-1.topicIndex (adjacent check)
   c. If conflict: topicIndex = (topicIndex + 1) % totalTopics
4. Store mapping: { studentId, assignmentId, topicSetId }

Properties:
  ✓ Deterministic (same assignment = same distribution always)
  ✓ No two adjacent roll numbers share same topic
  ✓ Balanced distribution across all topic sets
  ✓ Faculty can view/verify mapping
  ✓ Difficulty pre-balanced by faculty before publishing
```

---

## Notification Event Flow

```
Action Occurs (e.g., assignment created)
         │
         ▼
Service Layer fires: EventBus.emit('assignment.created', payload)
         │
         ▼
Notification Module listener receives event
         │
    ┌────┴─────────────────┐
    │                      │
    ▼                      ▼
In-App Notification    Email Notification
(saved to MongoDB)     (queued to SES)
    │                      │
    ▼                      ▼
Real-time push via    Delivered to student
SSE / WebSocket       institutional email
(future: Socket.io)
```
