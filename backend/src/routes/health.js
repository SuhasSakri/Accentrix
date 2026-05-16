const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/health
 * Check health of backend + AI service
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'accentrix-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    aiService: 'unknown',
  };

  try {
    const aiResponse = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
    health.aiService = aiResponse.data?.status || 'connected';
  } catch {
    health.aiService = 'unavailable';
  }

  res.json(health);
});

module.exports = router;
