const Redis = require('ioredis');

// Create a resilient Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => {
    if (times >= 3) {
      console.log('⚠️ Redis connection failed after 3 attempts');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
});

// Graceful shutdown handling
process.on('SIGINT', () => redis.quit());
process.on('SIGTERM', () => redis.quit());

module.exports = redis;