'use strict';

const noticeService = require('../services/notice.service');
const apiResponse = require('../../../shared/utils/apiResponse');

const createNotice = async (req, res, next) => {
  try {
    const notice = await noticeService.createNotice({
      ...req.body,
      postedBy: req.user._id,
    });
    return apiResponse.created(res, notice, 'Notice created');
  } catch (err) {
    next(err);
  }
};

const publishNotice = async (req, res, next) => {
  try {
    const notice = await noticeService.publishNotice(req.params.id, req.user._id);
    return apiResponse.success(res, notice, 'Notice published');
  } catch (err) {
    next(err);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await noticeService.updateNotice(req.params.id, req.body, req.user._id);
    return apiResponse.success(res, notice, 'Notice updated');
  } catch (err) {
    next(err);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const result = await noticeService.deleteNotice(req.params.id, req.user._id);
    return apiResponse.success(res, result, 'Notice deleted');
  } catch (err) {
    next(err);
  }
};

const getNotices = async (req, res, next) => {
  try {
    const { semesterId, includeExpired } = req.query;
    const targetRole = req.user.role;

    const { notices, page, limit, total } = await noticeService.getNotices({
      targetRole,
      semesterId,
      page: req.query.page,
      limit: req.query.limit,
      includeExpired,
    });
    return apiResponse.paginated(res, notices, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getNoticeById = async (req, res, next) => {
  try {
    const notice = await noticeService.getNoticeById(req.params.id);
    return apiResponse.success(res, notice, 'Notice fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { createNotice, publishNotice, updateNotice, deleteNotice, getNotices, getNoticeById };
