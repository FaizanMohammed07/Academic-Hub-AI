'use strict';

const observationService = require('../services/observation.service');
const { success, created, paginated } = require('../../../shared/utils/apiResponse');

const createObservation = async (req, res, next) => {
  try {
    const {
      subject, semester, student,
      experimentNumber, experimentTitle,
      date, aim, procedure, result, inference,
      maxMarks, remarks,
    } = req.body;

    const observation = await observationService.createObservation({
      subject,
      faculty: req.user._id,
      semester,
      student,
      experimentNumber,
      experimentTitle,
      date,
      aim,
      procedure,
      result,
      inference,
      maxMarks,
      remarks,
    });

    return created(res, observation, 'Observation created successfully');
  } catch (err) {
    next(err);
  }
};

const bulkCreate = async (req, res, next) => {
  try {
    const { subject, semester, observations } = req.body;
    const result = await observationService.bulkCreateObservations({
      subject,
      faculty: req.user._id,
      semester,
      observations,
    });
    return created(res, result, `${result.length} observation(s) created successfully`);
  } catch (err) {
    next(err);
  }
};

const getFacultyObservations = async (req, res, next) => {
  try {
    const { subjectId, semesterId, page, limit } = req.query;
    const result = await observationService.getObservationsByFaculty(req.user._id, {
      subjectId,
      semesterId,
      page,
      limit,
    });
    return paginated(res, result.observations, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

const getMyObservations = async (req, res, next) => {
  try {
    const { subjectId, semesterId } = req.query;
    const observations = await observationService.getObservationsByStudent(req.user._id, {
      subjectId,
      semesterId,
    });
    return success(res, observations);
  } catch (err) {
    next(err);
  }
};

const evaluateObservation = async (req, res, next) => {
  try {
    const { marks, remarks } = req.body;
    const observation = await observationService.evaluateObservation(
      req.params.id,
      req.user._id,
      { marks, remarks },
    );
    return success(res, observation, 'Observation evaluated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createObservation,
  bulkCreate,
  getMyObservations,
  getFacultyObservations,
  evaluateObservation,
};
