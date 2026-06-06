'use strict';

const timetableService = require('../services/timetable.service');
const { success, created } = require('../../../shared/utils/apiResponse');

const saveTimetable = async (req, res, next) => {
  try {
    const { semester, academicYear, section, effectiveFrom, slots } = req.body;
    const timetable = await timetableService.saveTimetable({
      semester,
      academicYear,
      section,
      effectiveFrom,
      slots,
      createdBy: req.user._id,
    });
    created(res, timetable, 'Timetable saved successfully');
  } catch (err) {
    next(err);
  }
};

const getTimetable = async (req, res, next) => {
  try {
    const { semesterId, section } = req.query;
    const timetable = await timetableService.getTimetable({ semesterId, section });
    success(res, timetable, 'Timetable fetched');
  } catch (err) {
    next(err);
  }
};

const getStudentTimetable = async (req, res, next) => {
  try {
    const timetable = await timetableService.getTimetableForStudent(req.user._id);
    success(res, timetable, 'Timetable fetched');
  } catch (err) {
    next(err);
  }
};

const getFacultyTimetable = async (req, res, next) => {
  try {
    const result = await timetableService.getTimetableForFaculty(req.user._id);
    success(res, result, 'Timetable fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { saveTimetable, getTimetable, getStudentTimetable, getFacultyTimetable };
