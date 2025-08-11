const cache = require('../services/cache');

const withCache = (keyGenerator, ttl) => {
  return async (req, res, next) => {
    try {
      const cacheKey = keyGenerator(req);
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log('We have cache');
        return res.json(JSON.parse(cachedData));
      }
      else{
        console.log('no cache');
      }

      // Monkey-patch res.json to cache before sending
      const originalJson = res.json;
      let isResponseSent = false;
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, JSON.stringify(body), ttl);
          isResponseSent = true;
        }
        originalJson.call(res, body);
      };

      next();
    } catch (err) {
      console.log('Cache invalidation error:', err);
      next(); // Proceed without caching
    }
  };
};

const invalidateCache = (patternGenerator) => {
  return async (req, res, next) => {
    try {
      // Handle both arrays and single generators
      const patterns = Array.isArray(patternGenerator) 
        ? patternGenerator.map(fn => fn(req)) 
        : [patternGenerator(req)];
      console.log('inside invalidateCache');
      await Promise.all(patterns.map(p => cache.invalidate(p)));
      const values = await Promise.all(patterns.map(p => cache.get(p)));
      values.forEach((val, i) => {
        if (val){
          console.log(`❌ Cache still exists for key: ${patterns[i]}`);
        }
        else{
          console.log(`Invalidated Cache Succesfully for key : ${patterns[i]}`);
        }
      });
      next();
    } catch (err) {
      console.log('Cache invalidation error:', err);
      next(); // Continue anyway
    }
  };
};

const updateCache = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      if (process.env.ENABLE_CACHE !== 'false') {
        const key = keyGenerator(req);
        const freshData = res.locals?.updatedData || req.body;
        await cache.set(key, JSON.stringify(freshData), ttl);        
        console.log('inside updateCache');
        const value = await cache.get(key);
        console.log('cache:', value);
      }
      next();
    } catch (err) {
      console.log('Cache update failed (non-blocking):', err);
      next();
    }
  };
};

module.exports = { withCache, invalidateCache, updateCache }; 