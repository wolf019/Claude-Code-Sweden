'use strict';

const express = require('express');
const { sessionData, resetSession, getStats } = require('../utils/storage');
const {
  createSession,
  getActiveSession,
  getTopWords,
  getAllSessions,
  clearAllData,
} = require('../utils/database');

const router = express.Router();

// POST /admin/question - Create new session with question (clears previous votes)
router.post('/question', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required and must be a string' });
  }

  const trimmedQuestion = question.trim();

  // Create new session in Firestore (deactivates old one)
  const session = await createSession(trimmedQuestion);

  // Update in-memory for this instance
  sessionData.question = trimmedQuestion;
  resetSession();

  // Emit to all connected clients on this instance
  const io = req.app.get('io');
  if (io) {
    io.emit('question-updated', { question: trimmedQuestion });
    io.emit('session-reset', { timestamp: new Date().toISOString() });
  }

  res.status(200).json({
    success: true,
    sessionId: session.sessionId,
    question: trimmedQuestion,
  });
});

// POST /admin/reset - Just reset current session (keep question)
router.post('/reset', async (req, res) => {
  // Get current question
  const session = await getActiveSession();
  const currentQuestion = session ? session.question : 'What word comes to mind?';

  // Create new session with same question
  const newSession = await createSession(currentQuestion);

  // Reset in-memory
  resetSession();

  // Emit to all connected clients
  const io = req.app.get('io');
  if (io) {
    io.emit('session-reset', { timestamp: new Date().toISOString() });
  }

  res.status(200).json({
    success: true,
    message: 'Session reset successfully',
    sessionId: newSession.sessionId,
  });
});

// GET /admin/stats - Get current session stats
router.get('/stats', async (_req, res) => {
  const stats = getStats();
  const session = await getActiveSession();
  const words = await getTopWords(50);

  res.status(200).json({
    ...stats,
    sessionId: session?.sessionId,
    currentQuestion: session?.question,
    wordCount: words.length,
  });
});

// GET /admin/sessions - Get all session history
router.get('/sessions', async (_req, res) => {
  const sessions = await getAllSessions();
  res.status(200).json({ sessions });
});

// POST /admin/clear-all - Clear all history (use with caution)
router.post('/clear-all', async (_req, res) => {
  await clearAllData();
  resetSession();

  const io = req.app.get('io');
  if (io) {
    io.emit('session-reset', { timestamp: new Date().toISOString() });
  }

  res.status(200).json({
    success: true,
    message: 'All data cleared',
  });
});

module.exports = router;
