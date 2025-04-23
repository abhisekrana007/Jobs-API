const redis = require('../config/redis');

class CacheService {
  constructor() {
    this.isCacheEnabled = process.env.ENABLE_CACHE === 'true';
  }

  async get(key) {
    if (!this.isCacheEnabled) return null;
    try {
      return await redis.get(key);
    } catch (err) {
      console.error('Cache read error:', err.message);
      return null;
    }
  }

  async set(key, value, ttl) {
    if (!this.isCacheEnabled) return;
    try {
      await redis.set(key, value, 'EX', ttl);
    } catch (err) {
      console.error('Cache write error:', err.message);
    }
  }

  async invalidate(pattern) {
    if (!this.isCacheEnabled) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(keys);
    } catch (err) {
      console.error('Cache invalidation error:', err.message);
    }
  }

  async update(key, updaterFn, ttl = 3600) {
    if (!this.isCacheEnabled) return null;
    
    try {
      const current = await this.get(key);
      const updated = await updaterFn(current);
      if (updated) await this.set(key, updated, ttl);
      return updated;
    } catch (err) {
      console.error('Cache update failed:', err);
      return null;
    }
  }

  async updateField(key, field, value, ttl = 3600) {
    if (!this.isCacheEnabled) return;
    await redis.hset(key, field, value);
    await redis.expire(key, ttl);
  }
  
}

module.exports = new CacheService();