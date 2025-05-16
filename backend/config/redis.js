const Redis = require('redis');
const { promisify } = require('util');

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Promisify Redis methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await getAsync(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }
      
      // Modify res.json to cache the response
      const originalJson = res.json;
      res.json = function(body) {
        setAsync(key, JSON.stringify(body), 'EX', duration);
        originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  redisClient,
  cache,
  getAsync,
  setAsync,
  delAsync
}; 