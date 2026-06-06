# VJIT IT Academic Hub AI

> Enterprise-grade AI-powered Digital Academic Ecosystem for the Information Technology Department — Vignana Jyothi Institute of Technology

---

## Project Overview

| Property | Value |
|---|---|
| **Platform** | VJIT IT Academic Hub AI |
| **Architecture** | Modular Monolith (MERN Stack) |
| **AI Engine** | OpenRouter API |
| **Deployment** | AWS EC2 + MongoDB Atlas + S3 + CloudFront |
| **Target Users** | Students, Faculty, HOD, Admin |
| **Scale Target** | 100,000+ users (university-wide) |

---

## Repository Structure

```
VJIT-IT/
├── public/                    # Admin-managed static assets (logos, photos, media)
├── client/                    # React 18 + Vite + TailwindCSS frontend
├── server/                    # Node.js + Express modular monolith backend
├── docs/                      # SRS, Architecture, API, Database docs
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas URI
- AWS credentials (S3, EC2)
- OpenRouter API key

### Installation

```bash
# Clone repository
git clone <repo-url>
cd VJIT-IT

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start development
cd server && npm run dev
cd client && npm run dev
```

---

## User Panels

| Panel | Login Field | Access Level |
|---|---|---|
| Student | Roll Number + Password | Own academic data |
| Faculty | Employee ID + Password | Assigned subjects/students |
| HOD | Employee ID + Password | Full department |
| Admin | Username + Password | Full system |

---

## Core Modules

- **Assignment Management** — Anti-copy engine, AI analysis, rubric grading
- **Observation Records** — Digital lab observation replacement
- **AI Engine** — Question generation, plagiarism detection, analytics
- **Academic Vault** — Student lifelong digital portfolio
- **Analytics** — Student, Faculty, Department, Semester dashboards
- **CMS** — Admin-managed public department website
- **Notifications** — In-app, email, push notification system

---

## Tech Stack

**Frontend:** React 18, Vite, TailwindCSS, ShadCN UI, Framer Motion, React Query  
**Backend:** Node.js, Express.js, Modular Monolith  
**Database:** MongoDB Atlas (Mongoose ODM)  
**Storage:** AWS S3 + CloudFront CDN  
**Auth:** JWT + Refresh Tokens + RBAC  
**AI:** OpenRouter API  
**Deployment:** AWS EC2, MongoDB Atlas, CloudFront  

---

## Documentation

| Document | Location |
|---|---|
| Software Requirements Spec | `docs/srs/` |
| System Architecture | `docs/architecture/` |
| Database Schema | `docs/database/` |
| API Reference | `docs/api/` |
| UI/UX Blueprint | `docs/ui-ux/` |
| Security Architecture | `docs/security/` |
| Development Roadmap | `docs/roadmap/` |

---

## Public Assets

Place all department media in `public/assets/`:

```
public/assets/
├── logos/          ← VJIT logo, IT dept logo
├── hod/            ← HOD photo, message
├── faculty/        ← Faculty photos, profiles
├── students/       ← Student achievement photos
├── achievements/   ← Awards, competition wins
├── gallery/        ← Events, activities, photos
├── videos/         ← Department videos
├── placements/     ← Placement showcase
├── internships/    ← Internship highlights
├── hackathons/     ← Hackathon participation
├── alumni/         ← Alumni success stories
├── research/       ← Research publications
├── certificates/   ← Department certificates
└── banners/        ← Website banners
```

> All assets are served via AWS S3 + CloudFront. Admin panel manages all uploads.

---

*Built with purpose — to digitize, innovate, and elevate the IT Department of VJIT.*
