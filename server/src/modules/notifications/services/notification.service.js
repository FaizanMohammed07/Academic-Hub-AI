'use strict';

const Notification = require('../models/notification.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');

/**
 * Create a single notification for one recipient.
 */
const createNotification = async (recipientId, { type, title, message, data, relatedEntity }) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    data: data || undefined,
    relatedEntity: relatedEntity || undefined,
  });
  return notification;
};

/**
 * Create notifications in bulk for multiple recipients.
 * Uses insertMany for efficiency.
 */
const createBulkNotifications = async (recipientIds, notificationData) => {
  if (!recipientIds || recipientIds.length === 0) return [];

  const docs = recipientIds.map((recipientId) => ({
    recipient: recipientId,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    data: notificationData.data || undefined,
    relatedEntity: notificationData.relatedEntity || undefined,
  }));

  const notifications = await Notification.insertMany(docs, { ordered: false });
  return notifications;
};

/**
 * Get paginated notifications for a user.
 * Sorted by createdAt descending.
 */
const getNotifications = async (userId, query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const { unreadOnly } = query;

  const filter = { recipient: userId };
  if (unreadOnly === 'true' || unreadOnly === true) {
    filter.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);

  return { notifications, page, limit, total };
};

/**
 * Mark a single notification as read, verifying the recipient owns it.
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw AppError.notFound('Notification not found');

  if (String(notification.recipient) !== String(userId)) {
    throw AppError.forbidden('Not authorized to update this notification');
  }

  if (notification.isRead) return notification;

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Mark all notifications for a user as read.
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return { modifiedCount: result.modifiedCount };
};

/**
 * Get unread notification count for the bell badge.
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { count };
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
