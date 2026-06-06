# MongoDB Schema Design — VJIT IT Academic Hub AI

**Database:** `vjit_it_hub`  
**ODM:** Mongoose 8.x  
**Hosting:** MongoDB Atlas M10+ (Mumbai region)

---

## Collections Overview

| Collection | Purpose |
|---|---|
| `users` | Base identity for all roles |
| `students` | Student-specific profile |
| `faculty` | Faculty-specific profile |
| `semesters` | Academic semester config |
| `subjects` | Subject/course catalog |
| `faculty_subject_maps` | Faculty ↔ Subject ↔ Semester mapping |
| `student_enrollments` | Student ↔ Semester ↔ Section |
| `timetables` | Class schedules |
| `assignments` | Assignment definitions |
| `topic_pools` | Anti-copy question sets |
| `student_topic_maps` | Student ↔ Topic set per assignment |
| `submissions` | Student assignment submissions |
| `observations` | Lab observation records |
| `quizzes` | Quiz definitions |
| `quiz_attempts` | Student quiz responses |
| `notifications` | In-app notifications |
| `vault_items` | Academic Vault entries |
| `cms_sections` | Public website content |
| `media_assets` | Uploaded media catalog |
| `audit_logs` | System-wide action trail |
| `ai_analyses` | AI analysis results |
| `refresh_tokens` | JWT refresh token store |
| `notices` | Department notices |
| `calendar_events` | Academic calendar |

---

## Schema Definitions

### users
```js
{
  _id: ObjectId,
  role: { type: String, enum: ['student','faculty','hod','admin'], required: true },
  loginId: { type: String, unique: true, required: true }, // rollNumber or employeeId
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: String,
  avatarUrl: String,              // S3 URL
  isActive: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  lastLogin: Date,
  passwordChangedAt: Date,
  notificationPrefs: {
    inApp:  { type: Boolean, default: true },
    email:  { type: Boolean, default: true },
    push:   { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}

Indexes:
  - loginId: unique
  - email: unique
  - role: 1
```

### students
```js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: { type: String, unique: true, required: true },
  regNumber: String,
  batch: String,              // e.g. "2022-2026"
  section: String,            // e.g. "A", "B"
  currentSemesterId: { type: ObjectId, ref: 'Semester' },
  cgpa: { type: Number, default: 0 },
  fatherName: String,
  dob: Date,
  address: String,
  admissionYear: Number,
  isLateral: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - userId: unique
  - rollNumber: unique
  - batch: 1, section: 1
```

### faculty
```js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, unique: true, required: true },
  designation: String,          // "Assistant Professor", "Associate Professor"
  qualification: [String],      // ["M.Tech", "Ph.D"]
  specialization: [String],
  experience: Number,           // years
  researchInterests: [String],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    url: String
  }],
  photoUrl: String,
  isHOD: { type: Boolean, default: false },
  joinedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### semesters
```js
{
  _id: ObjectId,
  name: { type: String, required: true },   // "IV Semester 2025-26"
  semNumber: { type: Number, required: true }, // 1–8
  academicYear: { type: String, required: true }, // "2025-26"
  startDate: Date,
  endDate: Date,
  sections: [String],           // ["A", "B", "C"]
  isActive: { type: Boolean, default: false },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - semNumber: 1, academicYear: 1 (unique)
  - isActive: 1
```

### subjects
```js
{
  _id: ObjectId,
  code: { type: String, unique: true, required: true },  // "CS401"
  name: { type: String, required: true },
  shortName: String,
  semesterId: { type: ObjectId, ref: 'Semester', required: true },
  credits: Number,
  type: { type: String, enum: ['theory','lab','project'], default: 'theory' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}

Indexes:
  - code: unique
  - semesterId: 1
```

### faculty_subject_maps
```js
{
  _id: ObjectId,
  facultyId: { type: ObjectId, ref: 'Faculty', required: true },
  subjectId: { type: ObjectId, ref: 'Subject', required: true },
  semesterId: { type: ObjectId, ref: 'Semester', required: true },
  sections: [String],           // which sections this faculty teaches
  isActive: { type: Boolean, default: true },
  assignedBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}

Indexes:
  - facultyId: 1, subjectId: 1, semesterId: 1 (unique)
```

### assignments
```js
{
  _id: ObjectId,
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['assignment1','assignment2','lab_observation','record','tutorial','mini_project'],
    required: true
  },
  description: String,          // Rich text (HTML)
  subjectId: { type: ObjectId, ref: 'Subject', required: true },
  semesterId: { type: ObjectId, ref: 'Semester', required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true },  // faculty
  sections: [String],
  deadline: { type: Date, required: true },
  gracePeriodMinutes: { type: Number, default: 0 },
  maxMarks: { type: Number, required: true },
  instructions: String,
  attachmentUrls: [String],     // S3 URLs
  rubric: [{
    criterion: String,
    maxScore: Number,
    description: String
  }],
  antiCopyEnabled: { type: Boolean, default: true },
  allowResubmission: { type: Boolean, default: false },
  status: { type: String, enum: ['draft','published','closed'], default: 'draft' },
  publishedAt: Date,
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - subjectId: 1, semesterId: 1
  - createdBy: 1
  - deadline: 1
  - status: 1
```

### topic_pools
```js
{
  _id: ObjectId,
  assignmentId: { type: ObjectId, ref: 'Assignment', required: true },
  sets: [{
    setLabel: String,           // "Set A", "Set B"
    questions: [String],        // question text array
    difficultyLevel: { type: String, enum: ['easy','medium','hard'] },
    estimatedMarks: Number
  }],
  distributionSeed: String,     // SHA256 of assignmentId
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}
```

### student_topic_maps
```js
{
  _id: ObjectId,
  assignmentId: { type: ObjectId, ref: 'Assignment', required: true },
  studentId: { type: ObjectId, ref: 'Student', required: true },
  topicSetIndex: Number,
  setLabel: String,
  questions: [String],
  createdAt: Date
}

Indexes:
  - assignmentId: 1, studentId: 1 (unique)
```

### submissions
```js
{
  _id: ObjectId,
  assignmentId: { type: ObjectId, ref: 'Assignment', required: true },
  studentId: { type: ObjectId, ref: 'Student', required: true },
  submittedBy: { type: ObjectId, ref: 'User', required: true },
  fileUrls: [String],           // S3 presigned or CDN URLs
  fileMetadata: [{
    originalName: String,
    mimeType: String,
    sizeBytes: Number,
    s3Key: String
  }],
  status: {
    type: String,
    enum: ['submitted','under_review','graded','rejected','resubmit_requested'],
    default: 'submitted'
  },
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  resubmissionCount: { type: Number, default: 0 },
  evaluation: {
    evaluatedBy: { type: ObjectId, ref: 'User' },
    evaluatedAt: Date,
    marksAwarded: Number,
    rubricScores: [{
      criterion: String,
      score: Number
    }],
    feedback: String,
    internalRemarks: String     // visible to faculty only
  },
  aiAnalysisId: { type: ObjectId, ref: 'AiAnalysis' },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - assignmentId: 1, studentId: 1 (unique unless resubmission)
  - assignmentId: 1, status: 1
  - studentId: 1
```

### ai_analyses
```js
{
  _id: ObjectId,
  submissionId: { type: ObjectId, ref: 'Submission', required: true },
  studentId: { type: ObjectId, ref: 'Student' },
  assignmentId: { type: ObjectId, ref: 'Assignment' },
  status: { type: String, enum: ['queued','processing','completed','failed'], default: 'queued' },
  scores: {
    originalityScore: Number,    // 0–100
    understandingScore: Number,
    aiProbabilityScore: Number,
    qualityScore: Number,
    overallScore: Number
  },
  details: {
    plagiarismMatches: [{
      matchedSubmissionId: ObjectId,
      similarityPercent: Number,
      matchedSegments: [String]
    }],
    aiGeneratedProbability: Number,
    technicalAnalysis: String,
    writingQualityAnalysis: String,
    relevanceAnalysis: String
  },
  rawPrompt: String,
  rawResponse: String,
  modelUsed: String,
  processingTimeMs: Number,
  processedAt: Date,
  createdAt: Date
}

Indexes:
  - submissionId: unique
  - studentId: 1
  - status: 1
```

### observations
```js
{
  _id: ObjectId,
  title: String,
  experimentNumber: Number,
  subjectId: { type: ObjectId, ref: 'Subject', required: true },
  semesterId: { type: ObjectId, ref: 'Semester' },
  createdBy: { type: ObjectId, ref: 'User', required: true },
  sections: [String],
  aim: String,
  theory: String,
  procedure: String,
  expectedOutput: String,
  viva: [{
    question: String,
    expectedAnswer: String
  }],
  maxMarks: { type: Number, default: 10 },
  deadline: Date,
  status: { type: String, enum: ['draft','published'], default: 'draft' },
  createdAt: Date,
  updatedAt: Date
}
```

### quizzes
```js
{
  _id: ObjectId,
  title: String,
  subjectId: { type: ObjectId, ref: 'Subject' },
  semesterId: { type: ObjectId, ref: 'Semester' },
  createdBy: { type: ObjectId, ref: 'User' },
  sections: [String],
  questions: [{
    questionText: String,
    type: { type: String, enum: ['mcq','true_false','short_answer'] },
    options: [String],          // for MCQ
    correctAnswer: String,
    marks: Number,
    explanation: String
  }],
  duration: Number,             // minutes
  totalMarks: Number,
  startTime: Date,
  endTime: Date,
  shuffleQuestions: { type: Boolean, default: true },
  shuffleOptions: { type: Boolean, default: true },
  showResultAfter: { type: Boolean, default: false },
  status: { type: String, enum: ['draft','active','closed'], default: 'draft' },
  createdAt: Date,
  updatedAt: Date
}
```

### vault_items
```js
{
  _id: ObjectId,
  studentId: { type: ObjectId, ref: 'Student', required: true },
  category: {
    type: String,
    enum: ['assignment','observation','project','certificate','resume','hackathon','internship','achievement','other'],
    required: true
  },
  title: String,
  description: String,
  fileUrls: [String],
  externalLink: String,
  date: Date,
  tags: [String],
  isPublic: { type: Boolean, default: false },
  source: { type: String, enum: ['system','manual'], default: 'manual' },
  sourceRefId: ObjectId,        // links to submission/observation if system-added
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - studentId: 1, category: 1
  - studentId: 1, date: -1
```

### cms_sections
```js
{
  _id: ObjectId,
  sectionKey: { type: String, unique: true, required: true }, // 'hero', 'stats', 'hod', etc.
  sectionName: String,
  isVisible: { type: Boolean, default: true },
  data: Object,                 // flexible JSON for each section
  updatedBy: { type: ObjectId, ref: 'User' },
  updatedAt: Date,
  createdAt: Date
}
```

### media_assets
```js
{
  _id: ObjectId,
  category: {
    type: String,
    enum: ['logo','faculty_photo','hod_photo','gallery','banner','video','achievement','placement','internship','hackathon','alumni','research','certificate']
  },
  title: String,
  description: String,
  s3Key: { type: String, required: true },
  s3Bucket: String,
  cdnUrl: String,
  mimeType: String,
  sizeBytes: Number,
  isPublic: { type: Boolean, default: true },
  uploadedBy: { type: ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  tags: [String],
  sortOrder: { type: Number, default: 0 }
}

Indexes:
  - category: 1
  - tags: 1
```

### audit_logs
```js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  role: String,
  action: { type: String, required: true },   // 'user.create', 'assignment.publish', etc.
  resource: String,                            // collection name
  resourceId: ObjectId,
  details: Object,                             // action-specific data
  ipAddress: String,
  userAgent: String,
  success: { type: Boolean, default: true },
  errorMessage: String,
  timestamp: { type: Date, default: Date.now, index: true }
}

Indexes:
  - userId: 1, timestamp: -1
  - action: 1
  - timestamp: -1 (TTL: 365 days)
```

### notifications
```js
{
  _id: ObjectId,
  recipientId: { type: ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['assignment_created','deadline_reminder','submission_graded','submission_rejected','notice_published','system'],
    required: true
  },
  title: { type: String, required: true },
  message: String,
  data: Object,                 // extra context payload
  isRead: { type: Boolean, default: false },
  readAt: Date,
  channels: {
    inApp: Boolean,
    email: Boolean,
    push: Boolean
  },
  createdAt: { type: Date, default: Date.now }
}

Indexes:
  - recipientId: 1, isRead: 1
  - recipientId: 1, createdAt: -1
  - createdAt: 1 (TTL: 90 days)
```

### refresh_tokens
```js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  replacedBy: String,
  createdAt: { type: Date, default: Date.now }
}

Indexes:
  - token: unique
  - userId: 1
  - expiresAt: 1 (TTL index)
```

---

## Collection Relationships

```
users ──────────────────────────────────────────────
  │                                                 │
  ├─1:1─► students ──────────────────────────────  │
  │           │                                   │  │
  │           ├─M:M─► student_enrollments         │  │
  │           ├─1:M─► submissions                 │  │
  │           ├─1:M─► vault_items                 │  │
  │           └─1:M─► quiz_attempts               │  │
  │                                               │  │
  ├─1:1─► faculty ────────────────────────────── │  │
  │           │                                   │  │
  │           └─M:M─► faculty_subject_maps        │  │
  │                        │                      │  │
  ├──────────► semesters ──┘                      │  │
  │                │                              │  │
  │                └──► subjects ─────────────── │  │
  │                          │                   │  │
  │                          ├──► assignments    │  │
  │                          │        │          │  │
  │                          │        ├──► topic_pools
  │                          │        ├──► student_topic_maps
  │                          │        └──► submissions ──► ai_analyses
  │                          │
  │                          └──► observations
  │                          └──► quizzes ──► quiz_attempts
  │
  └──► notifications
  └──► audit_logs
  └──► refresh_tokens
  └──► cms_sections (Admin managed)
  └──► media_assets (Admin managed)
```
