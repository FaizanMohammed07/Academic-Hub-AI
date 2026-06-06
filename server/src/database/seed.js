'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set in .env'); process.exit(1); }

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('\n✅  Connected to MongoDB Atlas\n');

  // Load models after connection
  const User                = require('../modules/users/models/user.model');
  const AcademicYear        = require('../modules/academic/models/academicYear.model');
  const Semester            = require('../modules/academic/models/semester.model');
  const Subject             = require('../modules/academic/models/subject.model');
  const FacultySubjectMapping = require('../modules/academic/models/facultySubjectMapping.model');
  const Enrollment          = require('../modules/academic/models/enrollment.model');
  const CmsSection          = require('../modules/cms/models/cmsSection.model');
  const Notice              = require('../modules/notices/models/notice.model');
  const Setting             = require('../modules/settings/models/setting.model');

  // ── Fresh mode ────────────────────────────────────────────────────────
  if (process.argv.includes('--fresh')) {
    console.log('🗑   Clearing existing seeded data...');
    await Promise.all([
      User.deleteMany({ email: { $regex: /@vjit\.ac\.in$/ } }),
      AcademicYear.deleteMany({}),
      Semester.deleteMany({}),
      Subject.deleteMany({}),
      FacultySubjectMapping.deleteMany({}),
      Enrollment.deleteMany({}),
      CmsSection.deleteMany({}),
      Notice.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    console.log('   Done\n');
  }

  // ── Step 1: Users ─────────────────────────────────────────────────────
  console.log('👤  Seeding users...');
  const USERS = [
    { role:'admin',   loginId:'admin',       email:'admin@vjit.ac.in',       fullName:'System Administrator',    phone:'+91 9000000001', password: process.env.SEED_ADMIN_PASSWORD   || 'Admin@12345' },
    { role:'hod',     loginId:'HOD001',      email:'hod.it@vjit.ac.in',      fullName:'Dr. Ramesh Babu Patnala', phone:'+91 9000000002', password: process.env.SEED_HOD_PASSWORD     || 'Hod@12345' },
    { role:'faculty', loginId:'FAC001',      email:'faculty1.it@vjit.ac.in', fullName:'Mrs. Priya Sharma',       phone:'+91 9000000003', password: process.env.SEED_FACULTY_PASSWORD || 'Faculty@12345' },
    { role:'faculty', loginId:'FAC002',      email:'faculty2.it@vjit.ac.in', fullName:'Mr. Suresh Kumar',        phone:'+91 9000000010', password: 'Faculty@12345' },
    { role:'faculty', loginId:'FAC003',      email:'faculty3.it@vjit.ac.in', fullName:'Dr. Anitha Rao',          phone:'+91 9000000011', password: 'Faculty@12345' },
    { role:'student', loginId:'21BD1A05G1',  email:'student1@vjit.ac.in',    fullName:'Arjun Reddy',             phone:'+91 9100000001', password: process.env.SEED_STUDENT_PASSWORD || 'Student@12345' },
    { role:'student', loginId:'21BD1A05G2',  email:'student2@vjit.ac.in',    fullName:'Priya Nair',              phone:'+91 9100000002', password: 'Student@12345' },
    { role:'student', loginId:'21BD1A05G3',  email:'student3@vjit.ac.in',    fullName:'Ravi Teja',               phone:'+91 9100000003', password: 'Student@12345' },
    { role:'student', loginId:'21BD1A05G4',  email:'student4@vjit.ac.in',    fullName:'Sneha Patel',             phone:'+91 9100000004', password: 'Student@12345' },
    { role:'student', loginId:'21BD1A05G5',  email:'student5@vjit.ac.in',    fullName:'Kiran Kumar',             phone:'+91 9100000005', password: 'Student@12345' },
  ];

  const userMap = {};
  for (const u of USERS) {
    let user = await User.findOne({ loginId: u.loginId });
    if (!user) {
      // Use the model's pre-save hook by setting passwordHash to plain password
      user = new User({
        role: u.role, loginId: u.loginId, email: u.email,
        fullName: u.fullName, phone: u.phone, isActive: true,
        passwordHash: u.password,
      });
      await user.save();
      console.log(`   ✓ [${u.role.padEnd(7)}] ${u.loginId}`);
    } else {
      console.log(`   - [${u.role.padEnd(7)}] ${u.loginId} (exists)`);
    }
    userMap[u.loginId] = user._id;
  }

  // ── Step 2: Academic Year ─────────────────────────────────────────────
  console.log('\n📅  Seeding academic year...');
  let ay = await AcademicYear.findOne({ name: '2024-25' });
  if (!ay) {
    ay = await AcademicYear.create({
      name: '2024-25',
      startDate: new Date('2024-07-01'),
      endDate:   new Date('2025-05-31'),
      isCurrent: true,
      status:    'active',
      createdBy: userMap['admin'],
    });
    console.log('   ✓ Academic Year 2024-25 (new)');
  } else {
    console.log('   - Academic Year 2024-25 (exists)');
  }

  // ── Step 3: Semesters ─────────────────────────────────────────────────
  console.log('\n📚  Seeding semesters...');
  const SEM_DEFS = [
    { number:3, name:'Semester 3', section:'A', startDate:new Date('2024-07-15'), endDate:new Date('2024-11-30'), isCurrent:true  },
    { number:5, name:'Semester 5', section:'A', startDate:new Date('2024-07-15'), endDate:new Date('2024-11-30'), isCurrent:false },
  ];
  const semMap = {};
  for (const s of SEM_DEFS) {
    let sem = await Semester.findOne({ academicYear: ay._id, number: s.number, section: s.section });
    if (!sem) {
      sem = await Semester.create({ ...s, academicYear: ay._id, createdBy: userMap['admin'] });
      console.log(`   ✓ Sem ${s.number}-${s.section}`);
    } else {
      console.log(`   - Sem ${s.number}-${s.section} (exists)`);
    }
    semMap[`${s.number}-${s.section}`] = sem._id;
  }

  // ── Step 4: Subjects ──────────────────────────────────────────────────
  console.log('\n📖  Seeding subjects...');
  const SUB_DEFS = [
    { code:'IT301', name:'Data Structures and Algorithms',  credits:4, type:'theory', sem:'3-A' },
    { code:'IT302', name:'Database Management Systems',     credits:4, type:'theory', sem:'3-A' },
    { code:'IT303', name:'Computer Networks',               credits:4, type:'theory', sem:'3-A' },
    { code:'IT304', name:'Operating Systems',               credits:4, type:'theory', sem:'3-A' },
    { code:'IT3L1', name:'DBMS Lab',                        credits:2, type:'lab',    sem:'3-A' },
    { code:'IT3L2', name:'Networks Lab',                    credits:2, type:'lab',    sem:'3-A' },
    { code:'IT501', name:'Machine Learning',                credits:4, type:'theory', sem:'5-A' },
    { code:'IT502', name:'Web Technologies',                credits:4, type:'theory', sem:'5-A' },
    { code:'IT503', name:'Software Engineering',            credits:4, type:'theory', sem:'5-A' },
    { code:'IT5L1', name:'Machine Learning Lab',            credits:2, type:'lab',    sem:'5-A' },
  ];
  const subMap = {};
  for (const s of SUB_DEFS) {
    let sub = await Subject.findOne({ code: s.code });
    if (!sub) {
      sub = await Subject.create({
        code: s.code, name: s.name, credits: s.credits, type: s.type,
        semester: semMap[s.sem], academicYear: ay._id,
        isActive: true, createdBy: userMap['admin'],
      });
      console.log(`   ✓ ${s.code} - ${s.name}`);
    } else {
      console.log(`   - ${s.code} (exists)`);
    }
    subMap[s.code] = sub._id;
  }

  // ── Step 5: Faculty–Subject Mappings ──────────────────────────────────
  console.log('\n🔗  Seeding faculty-subject mappings...');
  const MAP_DEFS = [
    { fac:'FAC001', sub:'IT301', sem:'3-A' },
    { fac:'FAC001', sub:'IT302', sem:'3-A' },
    { fac:'FAC002', sub:'IT303', sem:'3-A' },
    { fac:'FAC002', sub:'IT304', sem:'3-A' },
    { fac:'FAC003', sub:'IT3L1', sem:'3-A' },
    { fac:'FAC003', sub:'IT3L2', sem:'3-A' },
    { fac:'FAC001', sub:'IT501', sem:'5-A' },
    { fac:'FAC002', sub:'IT502', sem:'5-A' },
    { fac:'FAC003', sub:'IT503', sem:'5-A' },
    { fac:'FAC003', sub:'IT5L1', sem:'5-A' },
  ];
  for (const m of MAP_DEFS) {
    const exists = await FacultySubjectMapping.findOne({
      faculty: userMap[m.fac], subject: subMap[m.sub]
    });
    if (!exists) {
      await FacultySubjectMapping.create({
        faculty: userMap[m.fac], subject: subMap[m.sub],
        semester: semMap[m.sem], academicYear: ay._id,
        assignedBy: userMap['admin'], isActive: true, assignedAt: new Date(),
      });
      console.log(`   ✓ ${m.fac} → ${m.sub}`);
    } else {
      console.log(`   - ${m.fac} → ${m.sub} (exists)`);
    }
  }

  // ── Step 6: Enroll students in Sem 3-A ───────────────────────────────
  console.log('\n🎓  Enrolling students...');
  const STUDENT_ROLLS = ['21BD1A05G1','21BD1A05G2','21BD1A05G3','21BD1A05G4','21BD1A05G5'];
  for (const roll of STUDENT_ROLLS) {
    const exists = await Enrollment.findOne({ student: userMap[roll], semester: semMap['3-A'] });
    if (!exists) {
      await Enrollment.create({
        student: userMap[roll], semester: semMap['3-A'], academicYear: ay._id,
        rollNumber: roll, enrolledBy: userMap['admin'], enrolledAt: new Date(), isActive: true,
      });
      console.log(`   ✓ ${roll} → Sem 3-A`);
    } else {
      console.log(`   - ${roll} (already enrolled)`);
    }
  }
  await Semester.findByIdAndUpdate(semMap['3-A'], { studentCount: STUDENT_ROLLS.length });

  // ── Step 7: System Settings ───────────────────────────────────────────
  console.log('\n⚙️   Seeding system settings...');
  const SETTINGS = [
    { key:'site.name',                  value:'VJIT IT Academic Hub AI',                              category:'general',       description:'Platform name' },
    { key:'site.college',               value:'Vignana Jyothi Institute of Technology',               category:'general',       description:'College full name' },
    { key:'site.dept',                  value:'Department of Information Technology',                  category:'general',       description:'Department name' },
    { key:'site.address',               value:'Vignana Jyothi Nagar, Pragathi Nagar, Hyderabad — 500090', category:'general',   description:'Department address' },
    { key:'site.phone',                 value:'+91 40 2304 5678',                                     category:'general',       description:'Department phone' },
    { key:'site.email',                 value:'it.dept@vjit.ac.in',                                   category:'general',       description:'Department email' },
    { key:'ai.model.default',           value:'openai/gpt-4o-mini',                                   category:'ai',            description:'Default AI model for chat' },
    { key:'ai.model.analysis',          value:'openai/gpt-4o',                                        category:'ai',            description:'Model for submission analysis' },
    { key:'ai.model.questions',         value:'openai/gpt-4o',                                        category:'ai',            description:'Model for question generation' },
    { key:'ai.enabled',                 value:true,                                                   category:'ai',            description:'Enable AI features' },
    { key:'submission.gracePeriodMins', value:60,                                                     category:'academic',      description:'Late submission grace period (minutes)' },
    { key:'submission.maxSizeMB',       value:50,                                                     category:'academic',      description:'Max file upload size (MB)' },
    { key:'notif.email.enabled',        value:true,                                                   category:'notifications', description:'Enable email notifications' },
    { key:'security.maxFailedAttempts', value:5,                                                      category:'security',      description:'Failed login attempts before lockout' },
    { key:'security.lockoutMins',       value:15,                                                     category:'security',      description:'Account lockout duration (minutes)' },
  ];
  for (const s of SETTINGS) {
    await Setting.findOneAndUpdate(
      { key: s.key },
      { ...s, updatedBy: userMap['admin'] },
      { upsert: true, new: true }
    );
    console.log(`   ✓ ${s.key}`);
  }

  // ── Step 8: CMS Sections ──────────────────────────────────────────────
  console.log('\n🌐  Seeding CMS sections...');
  const CMS = [
    {
      sectionKey: 'hero', title: 'Hero', order: 1,
      data: {
        headline: 'VJIT IT Academic Hub AI',
        subheadline: 'AI-Powered Digital Academic Ecosystem for the IT Department',
        tagline: 'Where Innovation Meets Education',
      },
    },
    {
      sectionKey: 'stats', title: 'Stats', order: 2,
      data: {
        items: [
          { label:'Students',          value:'1,200+', icon:'users' },
          { label:'Faculty Members',   value:'32+',    icon:'graduation-cap' },
          { label:'Semesters',         value:'8',      icon:'book-open' },
          { label:'Placement Rate',    value:'95%',    icon:'trending-up' },
          { label:'Awards Won',        value:'120+',   icon:'trophy' },
          { label:'Years of Excellence',value:'15+',   icon:'star' },
        ],
      },
    },
    {
      sectionKey: 'hod', title: 'HOD Message', order: 3,
      data: {
        name:            'Dr. Ramesh Babu Patnala',
        designation:     'Professor & Head of Department',
        qualification:   'Ph.D. in Computer Science, IIT Hyderabad',
        experience:      '20+ years',
        photoUrl:        '',
        message:         'Welcome to the Department of Information Technology at VJIT. Our department is committed to nurturing future-ready engineers equipped with cutting-edge skills in AI, Cloud Computing, Cybersecurity, and Full-Stack Development.',
        qualifications:  ['Ph.D. Computer Science, IIT Hyderabad','M.Tech. Software Engineering, JNTUH','B.Tech. Computer Science, OU'],
        specializations: ['Artificial Intelligence','Machine Learning','Distributed Systems'],
      },
    },
    {
      sectionKey: 'contact', title: 'Contact', order: 11,
      data: {
        address:     'Vignana Jyothi Nagar, Pragathi Nagar, Hyderabad — 500090, Telangana',
        phone:       '+91 40 2304 5678',
        email:       'it.dept@vjit.ac.in',
        officeHours: 'Monday – Saturday, 9:00 AM – 5:00 PM',
        mapEmbedUrl: '',
      },
    },
  ];
  for (const section of CMS) {
    await CmsSection.findOneAndUpdate(
      { sectionKey: section.sectionKey },
      { ...section, isVisible: true, updatedBy: userMap['admin'] },
      { upsert: true, new: true }
    );
    console.log(`   ✓ cms:${section.sectionKey}`);
  }

  // ── Step 9: Welcome Notice ────────────────────────────────────────────
  console.log('\n📢  Seeding welcome notice...');
  const noticeExists = await Notice.findOne({ title: 'Welcome to VJIT IT Academic Hub AI' });
  if (!noticeExists) {
    await Notice.create({
      title: 'Welcome to VJIT IT Academic Hub AI',
      content: '<p>Dear Students and Faculty,</p><p>Welcome to the new AI-powered academic management platform. Log in with your credentials and explore the system. Contact <strong>admin@vjit.ac.in</strong> for any technical issues.</p><p>— IT Department, VJIT</p>',
      type: 'general',
      targetRoles: ['all'],
      postedBy: userMap['HOD001'],
      isPublished: true,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    console.log('   ✓ Welcome notice created');
  } else {
    console.log('   - Welcome notice (exists)');
  }

  // ── Done ──────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('✅  SEED COMPLETE\n');
  console.log('  Admin    →  ID: admin         Pass: Admin@12345');
  console.log('  HOD      →  ID: HOD001        Pass: Hod@12345');
  console.log('  Faculty  →  ID: FAC001        Pass: Faculty@12345  (FAC002, FAC003 same)');
  console.log('  Student  →  ID: 21BD1A05G1    Pass: Student@12345  (G2–G5 same)');
  console.log('\n  Academic Year: 2024-25  |  Current Sem: 3-A');
  console.log('──────────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  mongoose.disconnect();
  process.exit(1);
});
