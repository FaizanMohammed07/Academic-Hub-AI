'use strict';

const CmsSection = require('../models/cmsSection.model');
const Gallery = require('../models/gallery.model');
const Video = require('../models/video.model');
const Achievement = require('../models/achievement.model');
const Placement = require('../models/placement.model');
const Alumni = require('../models/alumni.model');
const Event = require('../models/event.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');

/* ══════════════════════════════════════════════
   CMS SECTIONS
══════════════════════════════════════════════ */

const upsertSection = async (sectionKey, data, updatedBy) => {
  const section = await CmsSection.findOneAndUpdate(
    { sectionKey },
    { sectionKey, data, updatedBy },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return section;
};

const getSection = async (sectionKey) => {
  const section = await CmsSection.findOne({ sectionKey }).lean();
  if (!section) throw AppError.notFound(`Section '${sectionKey}' not found`);
  return section;
};

const getAllPublicSections = async () => {
  const sections = await CmsSection.find({ isVisible: true })
    .sort({ order: 1 })
    .lean();
  return sections;
};

/* ══════════════════════════════════════════════
   GALLERY
══════════════════════════════════════════════ */

const createGalleryItem = async ({
  title,
  description,
  imageUrl,
  thumbnailUrl,
  category,
  capturedAt,
  uploadedBy,
}) => {
  const item = await Gallery.create({
    title,
    description,
    imageUrl,
    thumbnailUrl,
    category,
    capturedAt,
    uploadedBy,
  });
  return item;
};

const updateGalleryItem = async (id, updates, updatedBy) => {
  const item = await Gallery.findById(id);
  if (!item) throw AppError.notFound('Gallery item not found');

  const allowed = ['title', 'description', 'imageUrl', 'thumbnailUrl', 'category', 'capturedAt', 'isPublished', 'order'];
  allowed.forEach((f) => { if (updates[f] !== undefined) item[f] = updates[f]; });
  await item.save();
  return item;
};

const deleteGalleryItem = async (id, deletedBy) => {
  const item = await Gallery.findById(id);
  if (!item) throw AppError.notFound('Gallery item not found');
  await item.deleteOne();
  return { deleted: true };
};

const getGallery = async ({ category, page: pageQ, limit: limitQ, published } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });
  const filter = {};

  if (published !== 'false') filter.isPublished = true;
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    Gallery.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Gallery.countDocuments(filter),
  ]);

  return { items, page, limit, total };
};

/* ══════════════════════════════════════════════
   VIDEOS
══════════════════════════════════════════════ */

const createVideo = async ({
  title,
  description,
  videoUrl,
  thumbnailUrl,
  type,
  duration,
  category,
  uploadedBy,
}) => {
  const video = await Video.create({
    title,
    description,
    videoUrl,
    thumbnailUrl,
    type,
    duration,
    category,
    uploadedBy,
  });
  return video;
};

const updateVideo = async (id, updates, updatedBy) => {
  const video = await Video.findById(id);
  if (!video) throw AppError.notFound('Video not found');

  const allowed = ['title', 'description', 'videoUrl', 'thumbnailUrl', 'type', 'duration', 'category', 'isPublished', 'order'];
  allowed.forEach((f) => { if (updates[f] !== undefined) video[f] = updates[f]; });
  await video.save();
  return video;
};

const deleteVideo = async (id, deletedBy) => {
  const video = await Video.findById(id);
  if (!video) throw AppError.notFound('Video not found');
  await video.deleteOne();
  return { deleted: true };
};

const getVideos = async ({ category, page: pageQ, limit: limitQ, published } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });
  const filter = {};

  if (published !== 'false') filter.isPublished = true;
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    Video.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Video.countDocuments(filter),
  ]);

  return { items, page, limit, total };
};

/* ══════════════════════════════════════════════
   ACHIEVEMENTS
══════════════════════════════════════════════ */

const createAchievement = async (data, createdBy) => {
  const achievement = await Achievement.create({ ...data, createdBy });
  return achievement;
};

const updateAchievement = async (id, updates, updatedBy) => {
  const achievement = await Achievement.findById(id);
  if (!achievement) throw AppError.notFound('Achievement not found');

  const allowed = ['title', 'description', 'type', 'studentName', 'studentRoll', 'year', 'award', 'organizer', 'imageUrl', 'isPublished'];
  allowed.forEach((f) => { if (updates[f] !== undefined) achievement[f] = updates[f]; });
  await achievement.save();
  return achievement;
};

const deleteAchievement = async (id, deletedBy) => {
  const achievement = await Achievement.findById(id);
  if (!achievement) throw AppError.notFound('Achievement not found');
  await achievement.deleteOne();
  return { deleted: true };
};

const getAchievements = async ({ type, year, page: pageQ, limit: limitQ, published } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });
  const filter = {};

  if (published !== 'false') filter.isPublished = true;
  if (type) filter.type = type;
  if (year) filter.year = Number(year);

  const [items, total] = await Promise.all([
    Achievement.find(filter).sort({ year: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Achievement.countDocuments(filter),
  ]);

  return { items, page, limit, total };
};

/* ══════════════════════════════════════════════
   PLACEMENTS
══════════════════════════════════════════════ */

const createPlacement = async (data, createdBy) => {
  const placement = await Placement.create({ ...data, createdBy });
  return placement;
};

const updatePlacement = async (id, updates) => {
  const placement = await Placement.findById(id);
  if (!placement) throw AppError.notFound('Placement not found');

  const allowed = ['studentName', 'rollNumber', 'company', 'role', 'package', 'year', 'batch', 'type', 'studentPhoto', 'companyLogo', 'isPublished'];
  allowed.forEach((f) => { if (updates[f] !== undefined) placement[f] = updates[f]; });
  await placement.save();
  return placement;
};

const deletePlacement = async (id) => {
  const placement = await Placement.findById(id);
  if (!placement) throw AppError.notFound('Placement not found');
  await placement.deleteOne();
  return { deleted: true };
};

const getPlacements = async ({ year, page: pageQ, limit: limitQ, published } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });
  const filter = {};

  if (published !== 'false') filter.isPublished = true;
  if (year) filter.year = Number(year);

  const [items, total] = await Promise.all([
    Placement.find(filter).sort({ year: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Placement.countDocuments(filter),
  ]);

  return { items, page, limit, total };
};

/* ══════════════════════════════════════════════
   ALUMNI
══════════════════════════════════════════════ */

const createAlumni = async (data, createdBy) => {
  const alumni = await Alumni.create({ ...data, createdBy });
  return alumni;
};

const updateAlumni = async (id, updates) => {
  const alumni = await Alumni.findById(id);
  if (!alumni) throw AppError.notFound('Alumni not found');

  const allowed = ['name', 'batch', 'company', 'role', 'location', 'linkedinUrl', 'photo', 'testimonial', 'isPublished'];
  allowed.forEach((f) => { if (updates[f] !== undefined) alumni[f] = updates[f]; });
  await alumni.save();
  return alumni;
};

const deleteAlumni = async (id) => {
  const alumni = await Alumni.findById(id);
  if (!alumni) throw AppError.notFound('Alumni not found');
  await alumni.deleteOne();
  return { deleted: true };
};

const getAlumni = async ({ batch, page: pageQ, limit: limitQ, published } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });
  const filter = {};

  if (published !== 'false') filter.isPublished = true;
  if (batch) filter.batch = batch;

  const [items, total] = await Promise.all([
    Alumni.find(filter).sort({ batch: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Alumni.countDocuments(filter),
  ]);

  return { items, page, limit, total };
};

/* ══════════════════════════════════════════════
   EVENTS
══════════════════════════════════════════════ */

const createEvent = async (data, createdBy) => {
  const event = await Event.create({ ...data, createdBy });
  return event;
};

const updateEvent = async (id, updates) => {
  const event = await Event.findById(id);
  if (!event) throw AppError.notFound('Event not found');

  const allowed = ['title', 'description', 'type', 'startDate', 'endDate', 'venue', 'registrationLink', 'bannerUrl', 'isPublished', 'targetRoles'];
  allowed.forEach((f) => { if (updates[f] !== undefined) event[f] = updates[f]; });
  await event.save();
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findById(id);
  if (!event) throw AppError.notFound('Event not found');
  await event.deleteOne();
  return { deleted: true };
};

const getEvents = async ({ upcoming, past, page: pageQ, limit: limitQ, published } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });
  const filter = {};
  const now = new Date();

  if (published !== 'false') filter.isPublished = true;

  if (upcoming === 'true' || upcoming === true) {
    filter.startDate = { $gte: now };
  } else if (past === 'true' || past === true) {
    filter.startDate = { $lt: now };
  }

  const [items, total] = await Promise.all([
    Event.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit).lean(),
    Event.countDocuments(filter),
  ]);

  return { items, page, limit, total };
};

module.exports = {
  // Sections
  upsertSection,
  getSection,
  getAllPublicSections,
  // Gallery
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGallery,
  // Videos
  createVideo,
  updateVideo,
  deleteVideo,
  getVideos,
  // Achievements
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,
  // Placements
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacements,
  // Alumni
  createAlumni,
  updateAlumni,
  deleteAlumni,
  getAlumni,
  // Events
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
};
