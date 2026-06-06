'use strict';

const cmsService = require('../services/cms.service');
const apiResponse = require('../../../shared/utils/apiResponse');

/* ── Sections ───────────────────────────────── */

const upsertSection = async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) return next(require('../../../shared/errors/AppError').badRequest('sectionKey (key) is required'));
    const section = await cmsService.upsertSection(key, req.body.data, req.user._id);
    return apiResponse.success(res, section, 'Section saved');
  } catch (err) {
    next(err);
  }
};

const getSection = async (req, res, next) => {
  try {
    const section = await cmsService.getSection(req.params.key);
    return apiResponse.success(res, section, 'Section fetched');
  } catch (err) {
    next(err);
  }
};

const getAllPublicSections = async (req, res, next) => {
  try {
    const sections = await cmsService.getAllPublicSections();
    return apiResponse.success(res, sections, 'Public sections fetched');
  } catch (err) {
    next(err);
  }
};

/* ── Gallery ────────────────────────────────── */

const createGalleryItem = async (req, res, next) => {
  try {
    const item = await cmsService.createGalleryItem({ ...req.body, uploadedBy: req.user._id });
    return apiResponse.created(res, item, 'Gallery item created');
  } catch (err) {
    next(err);
  }
};

const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await cmsService.updateGalleryItem(req.params.id, req.body, req.user._id);
    return apiResponse.success(res, item, 'Gallery item updated');
  } catch (err) {
    next(err);
  }
};

const deleteGalleryItem = async (req, res, next) => {
  try {
    const result = await cmsService.deleteGalleryItem(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'Gallery item deleted');
  } catch (err) {
    next(err);
  }
};

const getGallery = async (req, res, next) => {
  try {
    const { category, published } = req.query;
    const { items, page, limit, total } = await cmsService.getGallery({
      category,
      published,
      page: req.query.page,
      limit: req.query.limit,
    });
    return apiResponse.paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/* ── Videos ─────────────────────────────────── */

const createVideo = async (req, res, next) => {
  try {
    const video = await cmsService.createVideo({ ...req.body, uploadedBy: req.user._id });
    return apiResponse.created(res, video, 'Video created');
  } catch (err) {
    next(err);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const video = await cmsService.updateVideo(req.params.id, req.body, req.user._id);
    return apiResponse.success(res, video, 'Video updated');
  } catch (err) {
    next(err);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const result = await cmsService.deleteVideo(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'Video deleted');
  } catch (err) {
    next(err);
  }
};

const getVideos = async (req, res, next) => {
  try {
    const { category, published } = req.query;
    const { items, page, limit, total } = await cmsService.getVideos({
      category,
      published,
      page: req.query.page,
      limit: req.query.limit,
    });
    return apiResponse.paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/* ── Achievements ───────────────────────────── */

const createAchievement = async (req, res, next) => {
  try {
    const achievement = await cmsService.createAchievement(req.body, req.user._id);
    return apiResponse.created(res, achievement, 'Achievement created');
  } catch (err) {
    next(err);
  }
};

const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await cmsService.updateAchievement(req.params.id, req.body, req.user._id);
    return apiResponse.success(res, achievement, 'Achievement updated');
  } catch (err) {
    next(err);
  }
};

const deleteAchievement = async (req, res, next) => {
  try {
    const result = await cmsService.deleteAchievement(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'Achievement deleted');
  } catch (err) {
    next(err);
  }
};

const getAchievements = async (req, res, next) => {
  try {
    const { type, year, published } = req.query;
    const { items, page, limit, total } = await cmsService.getAchievements({
      type,
      year,
      published,
      page: req.query.page,
      limit: req.query.limit,
    });
    return apiResponse.paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/* ── Placements ─────────────────────────────── */

const createPlacement = async (req, res, next) => {
  try {
    const placement = await cmsService.createPlacement(req.body, req.user._id);
    return apiResponse.created(res, placement, 'Placement created');
  } catch (err) {
    next(err);
  }
};

const updatePlacement = async (req, res, next) => {
  try {
    const placement = await cmsService.updatePlacement(req.params.id, req.body);
    return apiResponse.success(res, placement, 'Placement updated');
  } catch (err) {
    next(err);
  }
};

const deletePlacement = async (req, res, next) => {
  try {
    const result = await cmsService.deletePlacement(req.params.id);
    return apiResponse.success(res, result, 'Placement deleted');
  } catch (err) {
    next(err);
  }
};

const getPlacements = async (req, res, next) => {
  try {
    const { year, published } = req.query;
    const { items, page, limit, total } = await cmsService.getPlacements({
      year,
      published,
      page: req.query.page,
      limit: req.query.limit,
    });
    return apiResponse.paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/* ── Alumni ─────────────────────────────────── */

const createAlumni = async (req, res, next) => {
  try {
    const alumni = await cmsService.createAlumni(req.body, req.user._id);
    return apiResponse.created(res, alumni, 'Alumni record created');
  } catch (err) {
    next(err);
  }
};

const updateAlumni = async (req, res, next) => {
  try {
    const alumni = await cmsService.updateAlumni(req.params.id, req.body);
    return apiResponse.success(res, alumni, 'Alumni record updated');
  } catch (err) {
    next(err);
  }
};

const deleteAlumni = async (req, res, next) => {
  try {
    const result = await cmsService.deleteAlumni(req.params.id);
    return apiResponse.success(res, result, 'Alumni record deleted');
  } catch (err) {
    next(err);
  }
};

const getAlumni = async (req, res, next) => {
  try {
    const { batch, published } = req.query;
    const { items, page, limit, total } = await cmsService.getAlumni({
      batch,
      published,
      page: req.query.page,
      limit: req.query.limit,
    });
    return apiResponse.paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

/* ── Events ─────────────────────────────────── */

const createEvent = async (req, res, next) => {
  try {
    const event = await cmsService.createEvent(req.body, req.user._id);
    return apiResponse.created(res, event, 'Event created');
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await cmsService.updateEvent(req.params.id, req.body);
    return apiResponse.success(res, event, 'Event updated');
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const result = await cmsService.deleteEvent(req.params.id);
    return apiResponse.success(res, result, 'Event deleted');
  } catch (err) {
    next(err);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { upcoming, past, published } = req.query;
    const { items, page, limit, total } = await cmsService.getEvents({
      upcoming,
      past,
      published,
      page: req.query.page,
      limit: req.query.limit,
    });
    return apiResponse.paginated(res, items, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upsertSection,
  getSection,
  getAllPublicSections,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGallery,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideos,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacements,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  getAlumni,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
};
