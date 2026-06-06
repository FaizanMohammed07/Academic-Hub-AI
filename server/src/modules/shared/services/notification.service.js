'use strict';

const Notification = require('../../notifications/models/notification.model');

/**
 * Create a single in-app notification for one recipient.
 * @param {string|ObjectId} recipientId
 * @param {{ type, title, message, data?, relatedEntity? }} opts
 */
async function createNotification(recipientId, { type, title, message, data, relatedEntity }) {
  const doc = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    data: data || null,
    relatedEntity: relatedEntity || undefined,
  });
  return doc;
}

/**
 * Create the same notification for multiple recipients.
 * Uses insertMany for efficiency — skips duplicates silently.
 * @param {Array<string|ObjectId>} recipientIds
 * @param {{ type, title, message, data?, relatedEntity? }} opts
 */
async function createBulkNotifications(recipientIds, { type, title, message, data, relatedEntity }) {
  if (!recipientIds || recipientIds.length === 0) return [];

  const docs = recipientIds.map((recipientId) => ({
    recipient: recipientId,
    type,
    title,
    message,
    data: data || null,
    relatedEntity: relatedEntity || undefined,
  }));

  const result = await Notification.insertMany(docs, { ordered: false });
  return result;
}

module.exports = { createNotification, createBulkNotifications };
