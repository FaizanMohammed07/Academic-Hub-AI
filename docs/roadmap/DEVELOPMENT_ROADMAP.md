# Development Roadmap — VJIT IT Academic Hub AI

---

## Phase 0 — Project Setup (Week 1)

| Task | Owner | Status |
|---|---|---|
| Repository setup + folder structure | Dev Lead | ✅ Done |
| MongoDB Atlas cluster provisioned | DevOps | - |
| AWS S3 buckets created | DevOps | - |
| AWS EC2 instance configured | DevOps | - |
| CloudFront distribution configured | DevOps | - |
| Domain + SSL certificate | DevOps | - |
| Environment variables configured | Dev Lead | - |
| CI/CD pipeline (GitHub Actions) | DevOps | - |

---

## Phase 1 — Core Backend (Weeks 2–5)

**Sprint 1.1 — Auth + Users (Week 2)**
- [ ] User model + Student model + Faculty model
- [ ] JWT login (all roles)
- [ ] Refresh token rotation
- [ ] Account lockout logic
- [ ] Password reset via email OTP
- [ ] Admin: bulk student import via CSV
- [ ] Admin: user CRUD
- [ ] Admin: semester + subject configuration
- [ ] Faculty-subject mapping
- [ ] Audit logging middleware

**Sprint 1.2 — Assignment Engine (Week 3)**
- [ ] Assignment CRUD (Faculty)
- [ ] Topic Pool management
- [ ] Anti-copy distribution algorithm
- [ ] Student topic assignment generation
- [ ] S3 presigned upload URL endpoint
- [ ] Submission save + validation
- [ ] Late submission detection
- [ ] Submission status tracking

**Sprint 1.3 — AI Pipeline (Week 4)**
- [ ] OpenRouter API integration
- [ ] Analysis prompt builder
- [ ] Plagiarism cross-check logic
- [ ] AI analysis model + routes
- [ ] Event-driven analysis trigger
- [ ] Question generator endpoint
- [ ] Score parsing + storage

**Sprint 1.4 — Remaining Modules (Week 5)**
- [ ] Observations CRUD
- [ ] Quiz engine (creation + attempt)
- [ ] Academic Vault CRUD
- [ ] Notification service (in-app + email)
- [ ] Analytics aggregation pipelines
- [ ] CMS endpoints
- [ ] Media/S3 upload endpoints
- [ ] Timetable management

---

## Phase 2 — Complete Frontend (Weeks 6–9)

**Sprint 2.1 — Public Website (Week 6)**
- [ ] Hero section (animated)
- [ ] Stats counter section
- [ ] HOD message + photo section
- [ ] Faculty showcase grid
- [ ] Achievements carousel
- [ ] Placement records section
- [ ] Internship highlights
- [ ] Hackathon showcase
- [ ] Photo gallery with lightbox
- [ ] Video gallery
- [ ] Research section
- [ ] Alumni stories
- [ ] Contact section with map
- [ ] Public navbar + footer

**Sprint 2.2 — Auth + Student Panel (Week 7)**
- [ ] Login page (role selector)
- [ ] Student Dashboard
- [ ] Assignment Center (list + filter)
- [ ] Assignment Detail (view personal topic)
- [ ] File upload (drag + drop)
- [ ] Submission Detail + AI report summary
- [ ] Observations viewer
- [ ] Digital Notebook (rich text)
- [ ] Academic Vault
- [ ] Certificate Repository
- [ ] Timetable view
- [ ] Academic Calendar
- [ ] Portfolio generator trigger
- [ ] Notification bell + list

**Sprint 2.3 — Faculty Panel (Week 8)**
- [ ] Faculty Dashboard
- [ ] Create Assignment (multi-step form)
- [ ] Topic Pool Manager
- [ ] Assignment List
- [ ] Submission List per Assignment
- [ ] Evaluation Workspace (side-by-side)
- [ ] Rubric scoring form
- [ ] AI Analysis report (full view)
- [ ] Observation creation form
- [ ] Quiz builder
- [ ] AI Question Generator UI
- [ ] Student Analytics charts
- [ ] Marks export

**Sprint 2.4 — HOD + Admin Panel (Week 9)**
- [ ] HOD Dashboard with KPIs
- [ ] Faculty Monitor table
- [ ] Department Analytics charts
- [ ] Semester Analytics
- [ ] Reports download
- [ ] Notices management
- [ ] Admin Dashboard
- [ ] User Management (CRUD + CSV import)
- [ ] Semester + Subject configuration
- [ ] Faculty-Subject mapping UI
- [ ] CMS editor (all sections)
- [ ] Media Manager (upload, organize, delete)
- [ ] AI Configuration panel
- [ ] Audit Logs viewer
- [ ] System Monitor

---

## Phase 3 — Polish + Testing (Week 10)

- [ ] Dark mode testing across all panels
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Performance audit (Lighthouse > 90)
- [ ] API load testing (Artillery)
- [ ] Security audit (OWASP checks)
- [ ] Error boundary implementation
- [ ] Empty states for all lists
- [ ] Loading skeleton screens
- [ ] End-to-end test scenarios

---

## Phase 4 — Deployment + Launch (Week 11)

- [ ] Production environment setup
- [ ] EC2 deployment + PM2 cluster
- [ ] MongoDB Atlas production cluster (M10)
- [ ] CloudFront CDN configuration
- [ ] SSL + domain configuration
- [ ] Environment secrets in AWS Secrets Manager
- [ ] Log aggregation setup
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Admin seeded with HOD account
- [ ] Faculty and student accounts imported
- [ ] UAT with HOD, 2 faculty, 5 students
- [ ] Go/no-go sign-off

---

## Phase 5 — Post-Launch (Weeks 12+)

- [ ] Portfolio PDF generator (PDFKit)
- [ ] Push notifications (Web Push API)
- [ ] Redis caching for analytics
- [ ] Advanced AI: learning gap detection
- [ ] Mobile app (React Native) — separate project
- [ ] Multi-department expansion
- [ ] JNTU integration planning

---

## Tech Milestones Summary

| Milestone | Target Date |
|---|---|
| Backend API complete | End of Week 5 |
| Frontend complete | End of Week 9 |
| All tests passing | End of Week 10 |
| Production launch | End of Week 11 |
| First 100 active students | Week 13 |
| HOD analytics live | Week 12 |

---

## Team Roles (Suggested)

| Role | Responsibilities |
|---|---|
| Backend Dev | Express modules, MongoDB, AI integration |
| Frontend Dev | React panels, UI components |
| DevOps | AWS, CI/CD, monitoring |
| UI/UX | Design system, Figma, accessibility |
| QA | Test cases, UAT, performance testing |
| Project Lead | Architecture decisions, code review, stakeholder comms |
