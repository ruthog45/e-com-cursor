module.exports = {
  // Server configuration
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 5000,
    corsOrigin: process.env.FRONTEND_URL || 'https://your-domain.com',
  },

  // Security settings
  security: {
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    passwordMinLength: 10,
    jwtExpire: '7d',
    bcryptRounds: 12,
  },

  // Cache settings
  cache: {
    productTTL: 3600, // 1 hour
    categoryTTL: 7200, // 2 hours
    searchTTL: 1800, // 30 minutes
  },

  // Monitoring thresholds
  monitoring: {
    errorThreshold: 50, // alerts if error rate exceeds 50 per minute
    responseTimeThreshold: 500, // alerts if response time exceeds 500ms
    memoryThreshold: 80, // alerts if memory usage exceeds 80%
  },

  // Email configuration
  email: {
    orderConfirmationTemplate: 'order-confirmation',
    passwordResetTemplate: 'password-reset',
    shipmentNotificationTemplate: 'shipment-notification',
  },

  // Search configuration
  elasticsearch: {
    indexSettings: {
      number_of_shards: 3,
      number_of_replicas: 1,
      refresh_interval: '30s',
    },
    querySettings: {
      fuzziness: 'AUTO',
      minimumShouldMatch: '70%',
    },
  },

  // Redis configuration
  redis: {
    keyPrefix: 'prod:',
    reconnectStrategy: {
      maxAttempts: 10,
      initialDelay: 100,
      maxDelay: 3000,
    },
  },

  // MongoDB configuration
  mongodb: {
    poolSize: 10,
    writeConcern: {
      w: 'majority',
      j: true,
    },
    readPreference: 'primaryPreferred',
  },
}; 