# Public Assets Directory — VJIT IT Academic Hub AI

This folder contains all department media managed through the Admin Panel and served via **AWS S3 + CloudFront CDN**.

---

## Folder Structure

```
public/assets/
│
├── logos/
│   ├── vjit-logo.png               ← VJIT main institution logo
│   ├── vjit-logo.svg               ← SVG version for favicon
│   ├── it-dept-logo.png            ← IT Department logo
│   └── it-dept-logo-dark.png       ← Dark mode variant
│
├── hod/
│   ├── hod-photo.jpg               ← HOD official photograph
│   └── hod-signature.png           ← HOD signature (optional)
│
├── faculty/
│   ├── [employee-id]-photo.jpg     ← Faculty photos (named by employee ID)
│   └── ...
│
├── students/
│   └── achievements/
│       ├── [student-roll]-[event].jpg
│       └── ...
│
├── achievements/
│   ├── award-[year]-[title].jpg    ← Department awards, medals, trophies
│   └── ...
│
├── gallery/
│   ├── photos/
│   │   ├── [event-name]-[year]/    ← Event photos grouped by folder
│   │   └── ...
│   └── events/
│       └── ...
│
├── videos/
│   ├── dept-overview.mp4           ← Department overview video
│   ├── placement-story-[name].mp4
│   └── ...
│
├── placements/
│   ├── company-logos/
│   │   ├── [company-name].png
│   │   └── ...
│   └── placement-[year].jpg        ← Placement group photos
│
├── internships/
│   ├── [student-name]-[company].jpg
│   └── ...
│
├── hackathons/
│   ├── [hackathon-name]-[year].jpg
│   └── ...
│
├── alumni/
│   ├── [alumni-name]-photo.jpg
│   └── ...
│
├── research/
│   ├── [faculty-name]-[paper-title].pdf (thumbnail)
│   └── ...
│
├── certificates/
│   ├── dept-accreditation.jpg
│   └── ...
│
└── banners/
    ├── hero-banner.jpg             ← Main website hero banner
    ├── hero-banner-mobile.jpg      ← Mobile version
    └── event-banner-[name].jpg
```

---

## How to Add Assets

### Via Admin Panel (Recommended)
1. Login to Admin Panel → **Media Manager**
2. Select category (faculty, gallery, achievements, etc.)
3. Upload file — it auto-uploads to S3 and registers in database
4. Asset is immediately available on the public website

### Manual Upload (Development)
Place files in the appropriate subfolder above.  
In production, all files must be uploaded to **AWS S3** bucket: `vjit-it-assets`

---

## Image Guidelines

| Category | Recommended Size | Format |
|---|---|---|
| Logos | 400×400px | PNG/SVG (transparent bg) |
| HOD Photo | 400×500px | JPEG |
| Faculty Photos | 300×400px | JPEG |
| Hero Banner | 1920×600px | JPEG/WebP |
| Gallery Photos | 1200×800px | JPEG/WebP |
| Achievement Cards | 800×600px | JPEG |
| Company Logos | 200×100px | PNG (transparent bg) |

---

## CDN URL Pattern

All assets are served via CloudFront:
```
https://cdn.vjit-it.ac.in/[category]/[filename]
```

Example:
```
https://cdn.vjit-it.ac.in/faculty/EMP001-photo.jpg
https://cdn.vjit-it.ac.in/logos/it-dept-logo.png
https://cdn.vjit-it.ac.in/hod/hod-photo.jpg
```

---

> **Note:** Never commit actual photos or media files to Git.  
> This folder only contains the organizational structure.  
> All media is stored in AWS S3 and managed through the Admin CMS.
