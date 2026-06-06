'use strict';

/**
 * Simple singleton EventEmitter-based event bus.
 * Usage:
 *   const eventBus = require('./eventBus');
 *   eventBus.emit('submission.created', submissionId);
 *   eventBus.on('submission.created', handler);
 */

const { EventEmitter } = require('events');

const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

module.exports = eventBus;
