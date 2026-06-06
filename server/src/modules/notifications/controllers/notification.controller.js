'use strict';

const notificationService = require('../services/notification.service');
const apiResponse = require('../../../shared/utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const { notifications, page, limit, total } = await notificationService.getNotifications(
      req.user._id,
      req.query
    );
    return apiResponse.paginated(res, notifications, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return apiResponse.success(res, notification, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return apiResponse.success(res, result, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    return apiResponse.success(res, result, 'Unread count fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
