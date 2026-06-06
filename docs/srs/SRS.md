# Software Requirements Specification (SRS)
# VJIT IT Academic Hub AI

**Version:** 1.0  
**Date:** June 2026  
**Department:** Information Technology, VJIT  
**Classification:** Internal — Confidential  

---

## Table of Contents

1. Introduction
2. System Overview
3. Stakeholders & User Roles
4. Functional Requirements
5. Non-Functional Requirements
6. System Constraints
7. Use Case Specifications
8. Business Rules

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete requirements for VJIT IT Academic Hub AI — an enterprise-grade, AI-powered digital academic ecosystem built exclusively for the Information Technology Department of Vignana Jyothi Institute of Technology (VJIT), Hyderabad.

### 1.2 Scope
The platform digitizes all academic operations including assignment management, observation records, student portfolios, faculty evaluation workflows, and HOD-level department monitoring. An AI engine provides plagiarism detection, question generation, content analysis, and predictive analytics. The public-facing department website showcases faculty, students, achievements, placements, and departmental information.

### 1.3 Goals
| Goal | Description |
|---|---|
| G-01 | Eliminate paper-based assignment submission |
| G-02 | Eliminate physical lab observation records |
| G-03 | Prevent assignment copying via smart distribution |
| G-04 | Improve measurable student learning outcomes |
| G-05 | Reduce faculty administrative workload by 60%+ |
| G-06 | Provide real-time HOD-level department monitoring |
| G-07 | Build a scalable platform for future university-wide adoption |
| G-08 | Create a lifelong digital academic identity for every student |

### 1.4 Intended Audience
- HOD, IT Department, VJIT
- Faculty Members
- Software Development Team
- VJIT Administration
- JNTU Academic Bodies (future)

---

## 2. System Overview

### 2.1 System Context
```
┌─────────────────────────────────────────────────────────┐
│                 VJIT IT Academic Hub AI                  │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │ Student │ │ Faculty │ │   HOD   │ │    Admin    │  │
│  │  Panel  │ │  Panel  │ │  Panel  │ │    Panel    │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘  │
│       └───────────┴───────────┴──────────────┘          │
│                        │                                 │
│              ┌──────────┴──────────┐                    │
│              │   Express API GW    │                     │
│              └──────────┬──────────┘                    │
│    ┌──────┬─────────┬───┴────┬──────────┬──────────┐   │
│  Auth  Assign   Observe  Analytics  AI Engine  CMS  │   │
│    └──────┴─────────┴────────┴──────────┴──────────┘   │
│              │         │           │                     │
│         MongoDB     AWS S3    OpenRouter                 │
│          Atlas    CloudFront     API                     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Key System Boundaries
- **IN SCOPE:** Students and Faculty of IT Department, VJIT
- **OUT OF SCOPE (Phase 1):** Other departments, Alumni login, Mobile App
- **FUTURE SCOPE:** University-wide deployment, JNTU integration, Mobile App

---

## 3. Stakeholders & User Roles

### 3.1 Role Definitions

#### STUDENT
- Login: Roll Number + Password
- No self-registration; credentials provisioned by Admin
- Access: Own academic data only

#### FACULTY
- Login: Employee ID + Password
- No self-registration; provisioned by Admin
- Access: Assigned subjects, their student cohorts

#### HOD (Head of Department)
- Login: Employee ID + Password (elevated FACULTY role)
- Access: Department-wide monitoring, all faculty, all students
- Single HOD per department

#### ADMIN (Super Admin)
- Login: Username + Password
- Access: Complete system control
- Manages: All users, semesters, subjects, CMS, AI config, audit

### 3.2 Role Permission Matrix

| Feature | Student | Faculty | HOD | Admin |
|---|:---:|:---:|:---:|:---:|
| View own assignments | ✓ | - | - | ✓ |
| Submit assignments | ✓ | - | - | - |
| Create assignments | - | ✓ | - | - |
| Evaluate submissions | - | ✓ | - | - |
| View department analytics | - | - | ✓ | ✓ |
| Manage users | - | - | - | ✓ |
| Configure semesters | - | - | - | ✓ |
| Manage CMS / Website | - | - | - | ✓ |
| View faculty performance | - | - | ✓ | ✓ |
| Issue notices | - | ✓ | ✓ | ✓ |
| AI question generator | - | ✓ | - | - |
| View audit logs | - | - | - | ✓ |

---

## 4. Functional Requirements

### 4.1 Public Department Website (FR-PW)

| ID | Requirement |
|---|---|
| FR-PW-01 | Display Hero section with department tagline and call-to-action |
| FR-PW-02 | Show live department statistics (students, faculty, placements, years) |
| FR-PW-03 | Display HOD message with photo |
| FR-PW-04 | Showcase faculty profiles with name, designation, qualifications, photo |
| FR-PW-05 | Display student achievement cards (competitions, ranks, prizes) |
| FR-PW-06 | Show placement records with company logos and package data |
| FR-PW-07 | Showcase internship highlights |
| FR-PW-08 | Display hackathon participation and wins |
| FR-PW-09 | Photo and video gallery with category filters |
| FR-PW-10 | Research publications and papers section |
| FR-PW-11 | Alumni success stories |
| FR-PW-12 | Contact information with Google Maps embed |
| FR-PW-13 | All content editable via Admin CMS panel |
| FR-PW-14 | SEO-optimized, mobile-first responsive design |

### 4.2 Authentication (FR-AUTH)

| ID | Requirement |
|---|---|
| FR-AUTH-01 | Role-based login: student (roll number), faculty/hod/admin (employee ID) |
| FR-AUTH-02 | JWT access token (15 min expiry) + refresh token (7 days) |
| FR-AUTH-03 | Refresh token rotation on every use |
| FR-AUTH-04 | Failed login attempt tracking and account lockout after 5 attempts |
| FR-AUTH-05 | Secure password reset via email OTP |
| FR-AUTH-06 | All tokens invalidated on password change |
| FR-AUTH-07 | Role decoded from JWT; permissions checked per request |
| FR-AUTH-08 | Audit log entry on every login/logout |

### 4.3 Student Panel (FR-STU)

| ID | Requirement |
|---|---|
| FR-STU-01 | Dashboard: pending assignments, submission status, upcoming deadlines, GPA trend |
| FR-STU-02 | View enrolled subjects by current semester |
| FR-STU-03 | Assignment Center: list, filter, view detail, submit files |
| FR-STU-04 | View AI analysis report after submission |
| FR-STU-05 | Digital Observation Record: view lab observations created by faculty |
| FR-STU-06 | Digital Notebook: personal rich-text notes per subject |
| FR-STU-07 | Academic Vault: upload certificates, projects, achievements |
| FR-STU-08 | Portfolio Generator: auto-generate PDF portfolio from vault data |
| FR-STU-09 | Certificates Repository: store and view certificates |
| FR-STU-10 | Academic Calendar: semester events, exam dates, holidays |
| FR-STU-11 | Timetable: class schedule with subject, faculty, room |
| FR-STU-12 | Notifications: in-app bell with read/unread status |

### 4.4 Faculty Panel (FR-FAC)

| ID | Requirement |
|---|---|
| FR-FAC-01 | Dashboard: pending evaluations count, recent submissions, subject overview |
| FR-FAC-02 | Assignment creation: type selection, rich description, deadline, marks, rubrics |
| FR-FAC-03 | Attach files (PDF, DOCX, images) to assignments via S3 |
| FR-FAC-04 | Smart topic pool management for anti-copy distribution |
| FR-FAC-05 | View all student submissions per assignment |
| FR-FAC-06 | Evaluation workspace: side-by-side submission view + rubric scoring |
| FR-FAC-07 | Bulk feedback broadcast to all students of a subject |
| FR-FAC-08 | Observation record creation (Lab Experiment, Viva, Record) |
| FR-FAC-09 | Quiz creation with MCQ, True/False, Short Answer types |
| FR-FAC-10 | AI question generator: input topic → get question set |
| FR-FAC-11 | View AI analysis result for each submitted assignment |
| FR-FAC-12 | Student analytics: per-student submission history and scores |
| FR-FAC-13 | Marks export: download CSV of marks per subject |
| FR-FAC-14 | Department communication: send notices to students |

### 4.5 HOD Panel (FR-HOD)

| ID | Requirement |
|---|---|
| FR-HOD-01 | Department dashboard: KPIs — active students, faculty, submission rates |
| FR-HOD-02 | Faculty monitoring: per-faculty assignment count, evaluation speed, activity |
| FR-HOD-03 | Assignment monitoring: submission rates per subject, overdue tracking |
| FR-HOD-04 | Student performance analytics: section-wise, subject-wise, semester-wise |
| FR-HOD-05 | Faculty productivity analytics: comparative faculty performance charts |
| FR-HOD-06 | Semester analytics: completion rates, GPA distribution, subject performance |
| FR-HOD-07 | Notice management: publish department-wide announcements |
| FR-HOD-08 | Export reports: PDF and CSV for student/faculty performance |
| FR-HOD-09 | View full audit trail of faculty actions |

### 4.6 Admin Panel (FR-ADM)

| ID | Requirement |
|---|---|
| FR-ADM-01 | User management: create, update, deactivate students and faculty |
| FR-ADM-02 | Bulk student import via CSV |
| FR-ADM-03 | Semester configuration: create semesters, assign years, sections |
| FR-ADM-04 | Subject configuration: create subjects, assign to semesters |
| FR-ADM-05 | Faculty-subject mapping: assign faculty to subjects per semester |
| FR-ADM-06 | HOD designation management |
| FR-ADM-07 | CMS management: all public website sections |
| FR-ADM-08 | Media uploads: videos, photos, banners to S3 |
| FR-ADM-09 | Department announcement management |
| FR-ADM-10 | AI configuration: model selection, prompt tuning, API key management |
| FR-ADM-11 | Full audit log viewer with filters |
| FR-ADM-12 | System monitoring: API health, storage usage, active sessions |

### 4.7 Assignment Management (FR-ASN)

| ID | Requirement |
|---|---|
| FR-ASN-01 | Assignment types: Assignment 1, Assignment 2, Lab Observation, Record Submission, Tutorial, Mini Project |
| FR-ASN-02 | Each assignment has: title, description, subject, deadline, max marks, instructions, attachments, rubric |
| FR-ASN-03 | Faculty sets topic pool before publishing |
| FR-ASN-04 | System distributes unique topic combinations to students via anti-copy algorithm |
| FR-ASN-05 | Students can upload: PDF, DOCX, images, ZIP |
| FR-ASN-06 | Submission locked after deadline (configurable grace period) |
| FR-ASN-07 | Resubmission allowed if faculty permits |
| FR-ASN-08 | Submission triggers AI analysis pipeline automatically |

### 4.8 Anti-Copy Engine (FR-ACE)

| ID | Requirement |
|---|---|
| FR-ACE-01 | Faculty creates topic pool with N unique question sets |
| FR-ACE-02 | System assigns topic sets to students using seeded rotation algorithm |
| FR-ACE-03 | Assignment is same across all but questions/topics differ |
| FR-ACE-04 | Distribution ensures no two adjacent roll numbers share the same set |
| FR-ACE-05 | Difficulty is balanced across all sets before distribution |
| FR-ACE-06 | Topic assignment is deterministic (same seed = same result) for reproducibility |
| FR-ACE-07 | Faculty can view which student received which topic set |

### 4.9 AI Analysis Engine (FR-AI)

| ID | Requirement |
|---|---|
| FR-AI-01 | Trigger: automatic upon file submission |
| FR-AI-02 | Plagiarism detection: cross-check against all submissions in same assignment |
| FR-AI-03 | Similarity score: percentage overlap with other submissions |
| FR-AI-04 | AI-generated content detection: probability score |
| FR-AI-05 | Technical quality analysis: relevance to question, depth, accuracy |
| FR-AI-06 | Writing quality analysis: structure, grammar, coherence |
| FR-AI-07 | Output: Originality Score, Understanding Score, AI Probability Score, Quality Score (0-100) |
| FR-AI-08 | Faculty receives analysis report alongside submission |
| FR-AI-09 | Student sees a summary version of the report |
| FR-AI-10 | AI model: configured via Admin (OpenRouter model selection) |

### 4.10 Academic Vault (FR-VLT)

| ID | Requirement |
|---|---|
| FR-VLT-01 | Each student has a persistent Academic Vault |
| FR-VLT-02 | Sections: Assignments, Observations, Projects, Certificates, Resume, Hackathons, Internships, Achievements |
| FR-VLT-03 | System auto-populates from submitted and graded assignments |
| FR-VLT-04 | Student manually uploads external certificates, resume, achievements |
| FR-VLT-05 | Lifelong timeline view of all academic events |
| FR-VLT-06 | Portfolio Generator: one-click PDF generation |
| FR-VLT-07 | Share link: public shareable portfolio URL |

### 4.11 Analytics (FR-ANL)

| ID | Requirement |
|---|---|
| FR-ANL-01 | Student: submission rate trend, marks trend, subject comparison |
| FR-ANL-02 | Faculty: evaluation turnaround time, assignment creation frequency |
| FR-ANL-03 | Department: overall submission rates, subject-wise performance |
| FR-ANL-04 | Semester: completion rates, GPA distribution histogram |
| FR-ANL-05 | All analytics include date range filters |
| FR-ANL-06 | Charts: line, bar, pie, radar, heatmap |
| FR-ANL-07 | Data export: CSV and PDF |

### 4.12 Notification System (FR-NOT)

| ID | Requirement |
|---|---|
| FR-NOT-01 | In-app: bell icon with unread count badge |
| FR-NOT-02 | Email: transactional emails via SMTP/SES |
| FR-NOT-03 | Push: Web Push Notifications (future: mobile) |
| FR-NOT-04 | Triggers: assignment created, deadline 24h warning, submission graded, notice published |
| FR-NOT-05 | User notification preferences: opt-out per channel |
| FR-NOT-06 | HOD/Admin can broadcast department-wide notices |

---

## 5. Non-Functional Requirements

### 5.1 Performance
| NFR | Target |
|---|---|
| API response time (p95) | < 200ms |
| File upload (10MB) | < 5 seconds |
| Dashboard load time | < 1.5 seconds |
| Concurrent users (Phase 1) | 500 |
| Concurrent users (Scale target) | 10,000+ |
| AI analysis completion | < 30 seconds |

### 5.2 Availability
| NFR | Target |
|---|---|
| System uptime | 99.5% |
| Planned maintenance window | Sundays 2am–4am IST |
| Disaster recovery RTO | < 4 hours |
| Data backup frequency | Daily automated |

### 5.3 Security
- All data in transit: TLS 1.3
- All data at rest: AES-256 (S3 SSE, MongoDB Atlas encryption)
- JWT RS256 signed tokens
- Rate limiting: 100 req/min per IP, 1000 req/min per authenticated user
- File type validation + malware scanning on upload
- OWASP Top 10 mitigated by design
- Helmet.js security headers
- CORS restricted to known origins

### 5.4 Scalability
- Horizontal scaling via EC2 Auto Scaling Group
- MongoDB Atlas auto-scaling cluster
- S3 + CloudFront for static asset delivery
- Redis for session/cache (Phase 2)
- Event-driven notification queue (Phase 2)

### 5.5 Usability
- Mobile-first responsive design (320px – 4K)
- WCAG 2.1 AA accessibility compliance
- Light/Dark mode
- Page load < 2s on 4G connection
- Keyboard navigation support

---

## 6. System Constraints

| Constraint | Description |
|---|---|
| C-01 | No student self-registration; all accounts admin-provisioned |
| C-02 | File uploads limited to 50MB per file |
| C-03 | Video uploads for gallery: max 500MB per file |
| C-04 | OpenRouter API rate limits govern AI throughput |
| C-05 | MongoDB Atlas free tier limited to 512MB; paid cluster required for production |
| C-06 | Academic year runs June–May; semester defined by Admin |
| C-07 | Platform language: English only (Phase 1) |

---

## 7. Use Case Specifications

### UC-01: Student Submits Assignment

**Actor:** Student  
**Precondition:** Student logged in, assignment deadline not passed  
**Flow:**
1. Student opens Assignment Center
2. Selects active assignment
3. Views personal topic/question (anti-copy distributed)
4. Uploads file (PDF/DOCX/ZIP)
5. Confirms submission
6. System saves file to S3
7. System triggers AI analysis pipeline
8. Student receives confirmation notification
9. Faculty receives submission alert

**Postcondition:** Submission stored, AI analysis queued  
**Exception:** File type invalid → error shown, upload blocked

---

### UC-02: Faculty Evaluates Submission

**Actor:** Faculty  
**Precondition:** Faculty logged in, submissions available  
**Flow:**
1. Faculty opens Evaluation Workspace
2. Selects assignment → sees all submissions
3. Opens single submission: file preview + AI report shown side by side
4. Fills rubric scoring form
5. Writes feedback comment
6. Saves evaluation → marks recorded
7. Student receives grading notification

---

### UC-03: Admin Creates Student Account

**Actor:** Admin  
**Precondition:** Admin logged in  
**Flow:**
1. Admin goes to User Management
2. Selects "Import Students" → uploads CSV
3. System validates CSV format
4. Accounts created with roll number + default password
5. Welcome email sent to each student
6. Admin sees success/failure summary

---

## 8. Business Rules

| Rule | Description |
|---|---|
| BR-01 | A student can only submit an assignment once (unless faculty enables resubmission) |
| BR-02 | Submission is blocked if deadline has passed and grace period has expired |
| BR-03 | AI analysis is mandatory for all text-based submissions |
| BR-04 | A faculty can only access subjects assigned to them |
| BR-05 | HOD has read-only access to all faculty evaluation records |
| BR-06 | Admin cannot submit or evaluate assignments |
| BR-07 | Academic Vault data is never deleted, only archived |
| BR-08 | Marks once published to students cannot be changed without HOD approval |
| BR-09 | Password reset requires institutional email verification |
| BR-10 | All file uploads go to S3; no local server storage |
