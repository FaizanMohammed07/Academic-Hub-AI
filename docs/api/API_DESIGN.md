# API Design — VJIT IT Academic Hub AI

**Base URL:** `https://api.vjit-it.ac.in/api/v1`  
**Format:** REST JSON  
**Auth:** Bearer JWT (Authorization header)  
**Version:** v1  

---

## Authentication Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Standard Response Envelope

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "code": "VALIDATION_ERROR"
}
```

---

## Auth Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login all roles |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Auth | Logout + revoke token |
| POST | `/auth/forgot-password` | Public | Send OTP email |
| POST | `/auth/reset-password` | Public | Reset with OTP |
| GET | `/auth/me` | Auth | Current user profile |

### POST /auth/login
```json
// Request
{
  "loginId": "21BD1A05G1",
  "password": "student@123",
  "role": "student"
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "...",
      "fullName": "Rahul Kumar",
      "role": "student",
      "loginId": "21BD1A05G1",
      "avatarUrl": "..."
    }
  }
}
```

---

## Student Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/students/dashboard` | Student | Dashboard summary |
| GET | `/students/subjects` | Student | Enrolled subjects |
| GET | `/students/assignments` | Student | All assignments |
| GET | `/students/assignments/:id` | Student | Assignment detail + own topic |
| POST | `/students/assignments/:id/submit` | Student | Submit assignment |
| GET | `/students/submissions` | Student | Own submissions |
| GET | `/students/submissions/:id` | Student | Submission detail + AI brief |
| GET | `/students/observations` | Student | Lab observations |
| GET | `/students/timetable` | Student | Class timetable |
| GET | `/students/calendar` | Student | Academic calendar |
| GET | `/students/vault` | Student | Academic vault |
| POST | `/students/vault` | Student | Add vault item |
| DELETE | `/students/vault/:id` | Student | Remove vault item |
| GET | `/students/portfolio/generate` | Student | Generate PDF portfolio |
| GET | `/students/notifications` | Student | Notifications list |
| PATCH | `/students/notifications/:id/read` | Student | Mark as read |
| GET | `/students/profile` | Student | Own profile |
| PATCH | `/students/profile` | Student | Update profile |

---

## Faculty Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/faculty/dashboard` | Faculty | Faculty dashboard |
| GET | `/faculty/subjects` | Faculty | Assigned subjects |
| GET | `/faculty/students` | Faculty | Students in assigned sections |
| POST | `/faculty/assignments` | Faculty | Create assignment |
| GET | `/faculty/assignments` | Faculty | Own assignments |
| GET | `/faculty/assignments/:id` | Faculty | Assignment detail |
| PATCH | `/faculty/assignments/:id` | Faculty | Update assignment |
| DELETE | `/faculty/assignments/:id/draft` | Faculty | Delete draft |
| POST | `/faculty/assignments/:id/publish` | Faculty | Publish assignment |
| POST | `/faculty/assignments/:id/close` | Faculty | Close assignment |
| POST | `/faculty/assignments/:id/topic-pool` | Faculty | Set topic pool |
| GET | `/faculty/assignments/:id/submissions` | Faculty | All submissions |
| GET | `/faculty/submissions/:id` | Faculty | Submission + AI analysis |
| POST | `/faculty/submissions/:id/evaluate` | Faculty | Grade submission |
| POST | `/faculty/submissions/:id/reject` | Faculty | Reject submission |
| GET | `/faculty/analytics/students` | Faculty | Student analytics |
| GET | `/faculty/analytics/submissions` | Faculty | Submission stats |
| POST | `/faculty/observations` | Faculty | Create observation |
| GET | `/faculty/observations` | Faculty | Own observations |
| PATCH | `/faculty/observations/:id` | Faculty | Update observation |
| POST | `/faculty/quizzes` | Faculty | Create quiz |
| GET | `/faculty/quizzes` | Faculty | Own quizzes |
| POST | `/faculty/quizzes/:id/publish` | Faculty | Publish quiz |
| GET | `/faculty/quizzes/:id/results` | Faculty | Quiz results |
| POST | `/faculty/notices` | Faculty | Create notice |
| POST | `/faculty/bulk-feedback` | Faculty | Send bulk feedback |
| GET | `/faculty/marks/export/:subjectId` | Faculty | Export marks CSV |

---

## AI Endpoints (Faculty)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/ai/generate-questions` | Faculty | Generate question set |
| GET | `/ai/analysis/:submissionId` | Faculty | Full AI analysis |
| POST | `/ai/plagiarism-check` | Faculty | Manual plagiarism check |

### POST /ai/generate-questions
```json
// Request
{
  "topic": "Binary Trees",
  "subject": "Data Structures",
  "difficulty": "medium",
  "questionTypes": ["mcq", "short_answer"],
  "count": 10
}

// Response 200
{
  "success": true,
  "data": {
    "questions": [
      {
        "type": "mcq",
        "text": "What is the height of a complete binary tree with n nodes?",
        "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        "answer": "O(log n)",
        "difficulty": "medium"
      }
    ],
    "model": "openai/gpt-4o",
    "tokensUsed": 450
  }
}
```

---

## HOD Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/hod/dashboard` | HOD | Department KPIs |
| GET | `/hod/faculty` | HOD | All faculty list + activity |
| GET | `/hod/faculty/:id/analytics` | HOD | Faculty performance detail |
| GET | `/hod/assignments` | HOD | All department assignments |
| GET | `/hod/analytics/department` | HOD | Department-wide analytics |
| GET | `/hod/analytics/students` | HOD | All students performance |
| GET | `/hod/analytics/semester` | HOD | Semester analytics |
| GET | `/hod/analytics/subjects` | HOD | Subject-wise performance |
| POST | `/hod/notices` | HOD | Publish department notice |
| GET | `/hod/reports/performance` | HOD | Download PDF report |
| GET | `/hod/reports/submission-rates` | HOD | CSV submission report |
| GET | `/hod/audit-logs` | HOD | Faculty audit trail |

---

## Admin Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | System dashboard |
| GET | `/admin/users` | Admin | All users |
| POST | `/admin/users` | Admin | Create single user |
| PATCH | `/admin/users/:id` | Admin | Update user |
| DELETE | `/admin/users/:id` | Admin | Deactivate user |
| POST | `/admin/users/bulk-import` | Admin | CSV bulk student import |
| POST | `/admin/semesters` | Admin | Create semester |
| GET | `/admin/semesters` | Admin | List semesters |
| PATCH | `/admin/semesters/:id` | Admin | Update semester |
| POST | `/admin/semesters/:id/activate` | Admin | Set active semester |
| POST | `/admin/subjects` | Admin | Create subject |
| GET | `/admin/subjects` | Admin | List subjects |
| PATCH | `/admin/subjects/:id` | Admin | Update subject |
| POST | `/admin/faculty-mapping` | Admin | Map faculty to subject |
| DELETE | `/admin/faculty-mapping/:id` | Admin | Remove mapping |
| GET | `/admin/audit-logs` | Admin | Full audit logs |
| GET | `/admin/system/health` | Admin | System health check |
| GET | `/admin/system/stats` | Admin | Storage, API usage stats |
| GET | `/admin/ai/config` | Admin | Get AI configuration |
| PATCH | `/admin/ai/config` | Admin | Update AI config |

---

## CMS Endpoints (Admin)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/cms/public` | Public | All visible CMS sections |
| GET | `/cms/sections` | Admin | All sections |
| GET | `/cms/sections/:key` | Admin | Single section |
| PUT | `/cms/sections/:key` | Admin | Update section content |
| PATCH | `/cms/sections/:key/visibility` | Admin | Toggle visibility |

---

## Media Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/media/upload-url` | Auth | Get S3 presigned upload URL |
| POST | `/media` | Admin | Register uploaded media |
| GET | `/media` | Admin | List all media |
| GET | `/media/public` | Public | Public media by category |
| DELETE | `/media/:id` | Admin | Delete media + S3 object |

### GET /media/upload-url
```json
// Request query: ?category=faculty_photo&mimeType=image/jpeg&fileName=dr-kumar.jpg
// Response
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/vjit-it-assets/...?X-Amz-Signature=...",
    "s3Key": "faculty_photo/2026/dr-kumar.jpg",
    "cdnUrl": "https://cdn.vjit-it.ac.in/faculty_photo/2026/dr-kumar.jpg",
    "expiresIn": 300
  }
}
```

---

## Notification Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Auth | List notifications |
| PATCH | `/notifications/:id/read` | Auth | Mark single as read |
| PATCH | `/notifications/read-all` | Auth | Mark all as read |
| DELETE | `/notifications/:id` | Auth | Delete notification |
| GET | `/notifications/unread-count` | Auth | Unread count badge |

---

## Analytics Query Params

```
GET /faculty/analytics/students
  ?subjectId=...
  &section=A
  &from=2026-01-01
  &to=2026-06-01
  &type=submission_rate

GET /hod/analytics/department
  ?semesterId=...
  &metric=submission_rate|gpa|faculty_activity
  &groupBy=subject|section|faculty
```

---

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete) |
| 400 | Bad Request / Validation |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 413 | File too large |
| 422 | Unprocessable Entity |
| 429 | Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint Group | Limit |
|---|---|
| Public routes | 60 req/min per IP |
| Auth routes | 10 req/min per IP |
| General API | 300 req/min per token |
| AI endpoints | 20 req/min per token |
| File upload | 10 req/min per token |
