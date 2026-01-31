'use strict';

// Load environment variables (development only)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const adminRoutes = require('./routes/admin');
const { sessionData } = require('./utils/storage');
const { normalizeWord, validateWord } = require('./utils/wordNormalizer');
const {
  saveVote,
  getTopWords,
  isStopWord,
} = require('./utils/database');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

// Socket.io setup with WebSocket and polling fallback
const io = new Server(httpServer, {
  cors: { origin: '*' }, // Cloud Run compatibility
  transports: ['websocket', 'polling'], // Fallback support
});

// Store io instance for use in routes
app.set('io', io);

// Track connected clients
let connectedClients = 0;

// Rate limiting: track last vote timestamp per socket ID
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 5000; // 5 seconds between votes

// Debounce state for wordcloud updates
const DEBOUNCE_MS = 100; // 100ms aggregation window
let debounceTimer = null;
let pendingBroadcast = false;

/**
 * Broadcast wordcloud update to all clients with debouncing
 * Aggregates rapid updates within 100ms window
 * Uses database for persistent word counts
 */
function broadcastWordcloudUpdate() {
  pendingBroadcast = true;

  if (debounceTimer) {
    // Already waiting, update will include latest data
    return;
  }

  debounceTimer = setTimeout(async () => {
    if (pendingBroadcast) {
      // Get top words from database (or in-memory fallback)
      const words = await getTopWords(50);
      io.emit('wordcloud-update', { words });
      pendingBroadcast = false;
    }
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected: ${socket.id} (Total: ${connectedClients})`);

  // Broadcast connection count to all clients
  io.emit('connection-count', { count: connectedClients });

  // Handle join event
  socket.on('join', async (data) => {
    const name = data && typeof data.name === 'string' ? data.name.trim() : '';

    // Validate name (2-50 characters)
    if (name.length < 2 || name.length > 50) {
      socket.emit('join-error', { message: 'Name must be 2-50 characters' });
      return;
    }

    // Store participant info on socket
    socket.userName = name;
    sessionData.participants.add(socket.id);

    // Get current wordcloud data from database for late joiners
    const words = await getTopWords(50);

    // Send success with current question and wordcloud state
    socket.emit('join-success', {
      name: name,
      question: sessionData.question || 'What word comes to mind?',
      words: words,
    });

    console.log(`User joined: ${name} (${socket.id})`);
  });

  // Handle vote event
  socket.on('vote', async (data) => {
    // Check if user has joined
    if (!socket.userName) {
      socket.emit('vote-error', { message: 'Please join the session first' });
      return;
    }

    // Rate limiting check
    const now = Date.now();
    const lastVote = rateLimitMap.get(socket.id);
    if (lastVote && now - lastVote < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastVote)) / 1000);
      socket.emit('vote-error', {
        message: `Please wait ${waitTime} seconds before voting again`,
      });
      return;
    }

    // Get and normalize the word
    const rawWord = data && typeof data.word === 'string' ? data.word : '';
    const normalizedWord = normalizeWord(rawWord);

    // Validate the normalized word
    const validation = validateWord(normalizedWord);
    if (!validation.valid) {
      socket.emit('vote-error', { message: validation.error });
      return;
    }

    // Check for stop words
    if (isStopWord(normalizedWord)) {
      socket.emit('vote-error', { message: 'Common words like "the", "a", "and" are not allowed' });
      return;
    }

    // Store the vote in database (with atomic word count increment)
    const { word: storedWord } = await saveVote(normalizedWord, socket.id);

    // Also store in session for backwards compatibility
    sessionData.votes.push({
      word: storedWord,
      timestamp: new Date(),
      participantId: socket.id,
    });

    // Update rate limit timestamp
    rateLimitMap.set(socket.id, now);

    // Emit success to the voter (with uppercase word)
    socket.emit('vote-success', { word: storedWord });

    // Broadcast debounced wordcloud update to all clients
    broadcastWordcloudUpdate();

    console.log(`Vote received: "${storedWord}" from ${socket.userName}`);
  });

  socket.on('disconnect', (reason) => {
    connectedClients--;
    console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`);
    io.emit('connection-count', { count: connectedClients });

    // Clean up rate limit entry
    rateLimitMap.delete(socket.id);

    // Remove from participants
    sessionData.participants.delete(socket.id);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Admin routes
app.use('/admin', adminRoutes);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server only if this file is run directly
if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, httpServer, io };
