const express = require('express');
const mongoose = require('mongoose');
const { successResponse } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  const dbStateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

  return successResponse(res, 200, 'OK', {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    db: dbState,
  });
});

module.exports = router;
