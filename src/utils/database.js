'use strict';

/**
 * Database module for Firestore with history-based sessions
 * Each question creates a new session with its own votes
 *
 * Structure:
 * sessions/
 *   {sessionId}/
 *     question: string
 *     createdAt: timestamp
 *     isActive: boolean
 *     wordCounts: { WORD: count, ... }
 *     votes/ (subcollection)
 *       {voteId}/
 *         name: string
 *         word: string
 *         timestamp: timestamp
 */

const { Firestore, FieldValue } = require('@google-cloud/firestore');

// Database configuration
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'wordcloud-live';

// Stop words to filter from wordcloud
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'and', 'or', 'but',
]);

// In-memory fallback storage
let inMemorySession = {
  id: 'local',
  question: 'What word comes to mind?',
  wordCounts: {},
  votes: [],
};

// Firestore client (null if not available)
let db = null;

/**
 * Initialize Firestore client
 */
function initializeFirestore() {
  const projectId = process.env.GCP_PROJECT_ID;

  if (!projectId) {
    console.log('No GCP_PROJECT_ID set - using in-memory storage');
    return null;
  }

  try {
    db = new Firestore({
      projectId,
      databaseId: DATABASE_ID,
    });
    console.log(`Firestore initialized: ${projectId}/${DATABASE_ID}`);
    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error.message);
    console.log('Falling back to in-memory storage');
    return null;
  }
}

/**
 * Check if a word is a stop word
 */
function isStopWord(word) {
  if (typeof word !== 'string') return false;
  return STOP_WORDS.has(word.toLowerCase().trim());
}

/**
 * Normalize word for storage (uppercase, trimmed)
 */
function normalizeForStorage(word) {
  if (typeof word !== 'string') return '';
  return word.trim().replace(/[.,!?'-]/g, '').toUpperCase();
}

/**
 * Create a new session with a question
 * @param {string} question - The question for this session
 * @returns {Promise<{sessionId: string, question: string}>}
 */
async function createSession(question) {
  const timestamp = new Date();

  if (db) {
    try {
      // Deactivate any existing active sessions
      const activeSnapshot = await db.collection('sessions')
        .where('isActive', '==', true)
        .get();

      const batch = db.batch();
      activeSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });

      // Create new session
      const sessionRef = db.collection('sessions').doc();
      batch.set(sessionRef, {
        question: question,
        createdAt: timestamp,
        isActive: true,
        wordCounts: {},
      });

      await batch.commit();

      console.log(`Created new session: ${sessionRef.id}`);
      return { sessionId: sessionRef.id, question: question };
    } catch (error) {
      console.error('Firestore createSession error:', error.message);
    }
  }

  // In-memory fallback
  inMemorySession = {
    id: 'local-' + Date.now(),
    question: question,
    wordCounts: {},
    votes: [],
  };
  return { sessionId: inMemorySession.id, question: question };
}

/**
 * Get the current active session
 * @returns {Promise<{sessionId: string, question: string}|null>}
 */
async function getActiveSession() {
  if (db) {
    try {
      const snapshot = await db.collection('sessions')
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          sessionId: doc.id,
          question: doc.data().question,
        };
      }
      return null;
    } catch (error) {
      console.error('Firestore getActiveSession error:', error.message);
    }
  }

  // In-memory fallback
  return {
    sessionId: inMemorySession.id,
    question: inMemorySession.question,
  };
}

/**
 * Save a vote to the active session
 * @param {string} word - The word (already normalized)
 * @param {string} visitorName - The name of the voter
 * @param {string} visitorId - The socket ID
 * @returns {Promise<{success: boolean, word: string}>}
 */
async function saveVote(word, visitorName, visitorId) {
  const normalizedWord = normalizeForStorage(word);
  const timestamp = new Date();

  if (db) {
    try {
      const session = await getActiveSession();
      if (!session) {
        console.error('No active session for vote');
        return { success: false, word: normalizedWord };
      }

      const sessionRef = db.collection('sessions').doc(session.sessionId);

      // Add vote to subcollection
      await sessionRef.collection('votes').add({
        name: visitorName,
        word: normalizedWord,
        visitorId: visitorId,
        timestamp: timestamp,
      });

      // Increment word count in session document
      await sessionRef.update({
        [`wordCounts.${normalizedWord}`]: FieldValue.increment(1),
      });

      return { success: true, word: normalizedWord };
    } catch (error) {
      console.error('Firestore saveVote error:', error.message);
    }
  }

  // In-memory fallback
  inMemorySession.votes.push({
    name: visitorName,
    word: normalizedWord,
    visitorId: visitorId,
    timestamp: timestamp,
  });
  inMemorySession.wordCounts[normalizedWord] =
    (inMemorySession.wordCounts[normalizedWord] || 0) + 1;

  return { success: true, word: normalizedWord };
}

/**
 * Get top words for the active session
 * @param {number} limit - Max words to return
 * @returns {Promise<Array<[string, number]>>}
 */
async function getTopWords(limit = 50) {
  if (db) {
    try {
      const session = await getActiveSession();
      if (!session) return [];

      const doc = await db.collection('sessions').doc(session.sessionId).get();
      if (!doc.exists) return [];

      const wordCounts = doc.data().wordCounts || {};
      const entries = Object.entries(wordCounts);
      return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
    } catch (error) {
      console.error('Firestore getTopWords error:', error.message);
    }
  }

  // In-memory fallback
  const entries = Object.entries(inMemorySession.wordCounts);
  return entries.sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/**
 * Get the current question
 * @returns {Promise<string>}
 */
async function getQuestion() {
  const session = await getActiveSession();
  return session ? session.question : 'What word comes to mind?';
}

/**
 * Clear all sessions (for fresh start)
 * @returns {Promise<{success: boolean}>}
 */
async function clearAllData() {
  if (db) {
    try {
      const sessionsSnapshot = await db.collection('sessions').get();

      for (const sessionDoc of sessionsSnapshot.docs) {
        // Delete votes subcollection
        const votesSnapshot = await sessionDoc.ref.collection('votes').get();
        const batch = db.batch();
        votesSnapshot.docs.forEach(voteDoc => batch.delete(voteDoc.ref));
        await batch.commit();

        // Delete session document
        await sessionDoc.ref.delete();
      }

      return { success: true };
    } catch (error) {
      console.error('Firestore clearAllData error:', error.message);
    }
  }

  // In-memory fallback
  inMemorySession = {
    id: 'local',
    question: 'What word comes to mind?',
    wordCounts: {},
    votes: [],
  };

  return { success: true };
}

/**
 * Get all sessions (for history view)
 * @returns {Promise<Array>}
 */
async function getAllSessions() {
  if (db) {
    try {
      const snapshot = await db.collection('sessions')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Firestore getAllSessions error:', error.message);
    }
  }

  return [inMemorySession];
}

/**
 * Check if Firestore is connected
 */
function isFirestoreConnected() {
  return db !== null;
}

/**
 * Get stop words set (for testing)
 */
function getStopWords() {
  return STOP_WORDS;
}

// Initialize on module load
initializeFirestore();

module.exports = {
  initializeFirestore,
  isStopWord,
  normalizeForStorage,
  createSession,
  getActiveSession,
  saveVote,
  getTopWords,
  getQuestion,
  clearAllData,
  getAllSessions,
  isFirestoreConnected,
  getStopWords,
};
