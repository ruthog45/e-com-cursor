const express = require('express');
const router = express.Router();
const { redisClient } = require('../config/redis');
const { Client } = require('@elastic/elasticsearch');
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      mongodb: 'unknown',
      redis: 'unknown',
      elasticsearch: 'unknown'
    }
  };

  // Check MongoDB
  try {
    const mongoStatus = await mongoose.connection.db.admin().ping();
    health.services.mongodb = mongoStatus ? 'OK' : 'ERROR';
  } catch (e) {
    health.services.mongodb = 'ERROR';
    health.status = 'ERROR';
  }

  // Check Redis
  try {
    await redisClient.ping();
    health.services.redis = 'OK';
  } catch (e) {
    health.services.redis = 'ERROR';
    health.status = 'ERROR';
  }

  // Check Elasticsearch
  try {
    const esClient = new Client({ node: process.env.ELASTICSEARCH_URL });
    const esHealth = await esClient.cluster.health();
    health.services.elasticsearch = ['green', 'yellow'].includes(esHealth.status) ? 'OK' : 'ERROR';
  } catch (e) {
    health.services.elasticsearch = 'ERROR';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 500;
  res.status(statusCode).json(health);
});

module.exports = router; 