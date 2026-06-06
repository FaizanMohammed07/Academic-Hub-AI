const EventEmitter = require('events');
const logger = require('../utils/logger');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  publish(event, payload) {
    logger.debug(`[EventBus] publishing: ${event}`);
    this.emit(event, payload);
  }

  subscribe(event, handler) {
    this.on(event, async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error(`[EventBus] handler error for ${event}: ${err.message}`);
      }
    });
  }
}

module.exports = new EventBus();
