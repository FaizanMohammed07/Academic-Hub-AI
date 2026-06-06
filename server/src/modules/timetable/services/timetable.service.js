'use strict';

const Timetable = require('../models/timetable.model');
const Enrollment = require('../../academic/models/enrollment.model');
const AppError = require('../../../shared/errors/AppError');

/**
 * saveTimetable
 * Deactivates any existing active timetable for the semester+section, then creates a new one.
 */
const saveTimetable = async ({ semester, academicYear, section, effectiveFrom, slots, createdBy }) => {
  // Deactivate existing timetables for this semester+section
  const filter = { semester, isActive: true };
  if (section) filter.section = section;
  await Timetable.updateMany(filter, { isActive: false });

  const timetable = await Timetable.create({
    semester,
    academicYear,
    section: section || null,
    effectiveFrom: effectiveFrom || new Date(),
    slots: slots || [],
    createdBy,
    isActive: true,
  });

  return timetable.populate([
    { path: 'semester', select: 'name number section' },
    { path: 'academicYear', select: 'name' },
    { path: 'slots.subject', select: 'name code type' },
    { path: 'slots.faculty', select: 'fullName email' },
  ]);
};

/**
 * getTimetable
 * Returns active timetable for the given semester (and optional section), with subject and faculty populated.
 */
const getTimetable = async ({ semesterId, section } = {}) => {
  if (!semesterId) throw AppError.badRequest('semesterId query parameter is required');

  const filter = { semester: semesterId, isActive: true };
  if (section) filter.section = section;

  const timetable = await Timetable.findOne(filter)
    .populate('semester', 'name number section')
    .populate('academicYear', 'name')
    .populate('slots.subject', 'name code type')
    .populate('slots.faculty', 'fullName email')
    .lean();

  if (!timetable) throw AppError.notFound('No active timetable found for the specified semester');
  return timetable;
};

/**
 * getTimetableForStudent
 * Finds the student's active enrollment → semester → timetable.
 */
const getTimetableForStudent = async (studentId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true }).lean();
  if (!enrollment) throw AppError.notFound('No active enrollment found for this student');

  const timetable = await Timetable.findOne({ semester: enrollment.semester, isActive: true })
    .populate('semester', 'name number section')
    .populate('academicYear', 'name')
    .populate('slots.subject', 'name code type')
    .populate('slots.faculty', 'fullName email')
    .lean();

  if (!timetable) throw AppError.notFound('No active timetable found for your semester');
  return timetable;
};

/**
 * getTimetableForFaculty
 * Finds all active timetables, filters slots where slot.faculty = facultyId,
 * returns structured weekly schedule.
 */
const getTimetableForFaculty = async (facultyId) => {
  const timetables = await Timetable.find({ isActive: true })
    .populate('semester', 'name number section')
    .populate('academicYear', 'name')
    .populate('slots.subject', 'name code type')
    .populate('slots.faculty', 'fullName email')
    .lean();

  // Build weekly schedule grouped by day
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklySchedule = {};
  days.forEach((d) => { weeklySchedule[d] = []; });

  timetables.forEach((tt) => {
    (tt.slots || []).forEach((slot) => {
      const slotFacultyId = slot.faculty && (slot.faculty._id || slot.faculty);
      if (slotFacultyId && slotFacultyId.toString() === facultyId.toString()) {
        if (weeklySchedule[slot.day]) {
          weeklySchedule[slot.day].push({
            ...slot,
            semester: tt.semester,
            academicYear: tt.academicYear,
            section: tt.section,
          });
        }
      }
    });
  });

  // Sort each day's slots by periodNumber
  days.forEach((d) => {
    weeklySchedule[d].sort((a, b) => a.periodNumber - b.periodNumber);
  });

  return { weeklySchedule };
};

module.exports = { saveTimetable, getTimetable, getTimetableForStudent, getTimetableForFaculty };
