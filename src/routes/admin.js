'use strict';

const express = require('express');
const { sessionData, resetSession, getStats } = require('../utils/storage');
const { clearAllData, getVoteCount } = require('../utils/database');

const router = express.Router();

// POST /admin/question - Set active question
router.post('/question', (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required and must be a string' });
  }

  sessionData.question = question.trim();

  // Emit to all connected clients
  const io = req.app.get('io');
  if (io) {
    io.emit('question-updated', { question: sessionData.question });
  }

  res.status(200).json({
    success: true,
    question: sessionData.question,
  });
});

// POST /admin/reset - Clear all votes
router.post('/reset', async (req, res) => {
  // Reset in-memory session data
  resetSession();

  // Clear database (Firestore or in-memory fallback)
  await clearAllData();

  // Emit to all connected clients
  const io = req.app.get('io');
  if (io) {
    io.emit('session-reset', { timestamp: new Date().toISOString() });
  }

  res.status(200).json({
    success: true,
    message: 'Session reset successfully',
  });
});

// GET /admin/stats - Get participant and vote counts
router.get('/stats', async (_req, res) => {
  const stats = getStats();
  // Get persistent vote count from database
  const persistentVoteCount = await getVoteCount();
  res.status(200).json({
    ...stats,
    persistentVoteCount,
  });
});

module.exports = router;
