'use strict';

// Shared in-memory session data for the live demo
const sessionData = {
  question: '',
  votes: [], // Array of vote objects { word: string, timestamp: Date }
  participants: new Set(), // Track unique socket IDs
};

// Reset all votes and participants
const resetSession = () => {
  sessionData.votes = [];
  sessionData.participants.clear();
};

// Get current stats
const getStats = () => ({
  participantCount: sessionData.participants.size,
  voteCount: sessionData.votes.length,
  currentQuestion: sessionData.question,
});

module.exports = {
  sessionData,
  resetSession,
  getStats,
};
