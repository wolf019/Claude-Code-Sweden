'use strict';

/**
 * Database module for Firestore integration with in-memory fallback
 * Provides persistent storage for votes with atomic word count increments
 */

const { Firestore } = require('@google-cloud/firestore');

// Stop words to filter from wordcloud
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'and',
  'or',
  'but',
]);

// In-memory fallback storage
const inMemoryVotes = [];
const inMemoryWordCounts = new Map();

// Firestore client (null if not available)
let db = null;

/**
 * Initialize Firestore client
 * Falls back to in-memory storage if Firestore is unavailable
 */
function initializeFirestore() {
  const projectId = process.env.GCP_PROJECT_ID;

  if (!projectId) {
    console.log('No GCP_PROJECT_ID set - using in-memory storage');
    return null;
  }

  try {
    db = new Firestore({ projectId });
    console.log(`Firestore initialized for project: ${projectId}`);
    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error.message);
    console.log('Falling back to in-memory storage');
    return null;
  }
}

/**
 * Check if a word is a stop word
 * @param {string} word - The word to check (will be lowercased for comparison)
 * @returns {boolean} - True if it's a stop word
 */
function isStopWord(word) {
  if (typeof word !== 'string') return false;
  return STOP_WORDS.has(word.toLowerCase().trim());
}

/**
 * Normalize word for storage and aggregation
 * Converts to uppercase, trims, and strips punctuation
 * @param {string} word - The word to normalize
 * @returns {string} - The normalized word in uppercase
 */
function normalizeForStorage(word) {
  if (typeof word !== 'string') return '';
  return word
    .trim()
    .replace(/[.,!?'-]/g, '')
    .toUpperCase();
}

/**
 * Save a vote and increment word count atomically
 * @param {string} word - The word being voted for (already normalized)
 * @param {string} sessionId - The socket/session ID of the voter
 * @returns {Promise<{success: boolean, word: string}>}
 */
async function saveVote(word, sessionId) {
  const normalizedWord = normalizeForStorage(word);
  const timestamp = new Date();

  if (db) {
    try {
      // Use a transaction for atomic increment
      // IMPORTANT: All reads must come before writes in Firestore transactions
      await db.runTransaction(async (transaction) => {
        // References
        const voteRef = db.collection('votes').doc();
        const wordCountRef = db.collection('wordcounts').doc(normalizedWord);

        // READ FIRST - get current word count
        const wordCountDoc = await transaction.get(wordCountRef);

        // THEN WRITE - save the vote
        transaction.set(voteRef, {
          word: normalizedWord,
          sessionId,
          timestamp,
        });

        // WRITE - update or create word count
        if (wordCountDoc.exists) {
          transaction.update(wordCountRef, {
            count: Firestore.FieldValue.increment(1),
            lastUpdated: timestamp,
          });
        } else {
          transaction.set(wordCountRef, {
            word: normalizedWord,
            count: 1,
            lastUpdated: timestamp,
          });
        }
      });

      return { success: true, word: normalizedWord };
    } catch (error) {
      console.error('Firestore saveVote error:', error.message);
      // Fall through to in-memory storage
    }
  }

  // In-memory fallback
  inMemoryVotes.push({
    word: normalizedWord,
    sessionId,
    timestamp,
  });

  const currentCount = inMemoryWordCounts.get(normalizedWord) || 0;
  inMemoryWordCounts.set(normalizedWord, currentCount + 1);

  return { success: true, word: normalizedWord };
}

/**
 * Get top words by count for wordcloud
 * @param {number} limit - Maximum number of words to return (default: 50)
 * @returns {Promise<Array<[string, number]>>} - Array of [word, count] tuples
 */
async function getTopWords(limit = 50) {
  if (db) {
    try {
      const snapshot = await db
        .collection('wordcounts')
        .orderBy('count', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return [data.word, data.count];
      });
    } catch (error) {
      console.error('Firestore getTopWords error:', error.message);
      // Fall through to in-memory storage
    }
  }

  // In-memory fallback
  const entries = Array.from(inMemoryWordCounts.entries());
  return entries.sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/**
 * Get all votes (for compatibility with existing code)
 * @returns {Promise<Array<{word: string, sessionId: string, timestamp: Date}>>}
 */
async function getAllVotes() {
  if (db) {
    try {
      const snapshot = await db
        .collection('votes')
        .orderBy('timestamp', 'desc')
        .get();

      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error('Firestore getAllVotes error:', error.message);
      // Fall through to in-memory storage
    }
  }

  // In-memory fallback
  return [...inMemoryVotes];
}

/**
 * Clear all data (votes and word counts)
 * Used for session reset
 * @returns {Promise<{success: boolean}>}
 */
async function clearAllData() {
  if (db) {
    try {
      // Delete all votes
      const votesSnapshot = await db.collection('votes').get();
      const votesBatch = db.batch();
      votesSnapshot.docs.forEach((doc) => votesBatch.delete(doc.ref));
      await votesBatch.commit();

      // Delete all word counts
      const wordcountsSnapshot = await db.collection('wordcounts').get();
      const wordcountsBatch = db.batch();
      wordcountsSnapshot.docs.forEach((doc) => wordcountsBatch.delete(doc.ref));
      await wordcountsBatch.commit();

      return { success: true };
    } catch (error) {
      console.error('Firestore clearAllData error:', error.message);
      // Fall through to in-memory storage
    }
  }

  // In-memory fallback
  inMemoryVotes.length = 0;
  inMemoryWordCounts.clear();

  return { success: true };
}

/**
 * Get vote count
 * @returns {Promise<number>}
 */
async function getVoteCount() {
  if (db) {
    try {
      const snapshot = await db.collection('votes').count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('Firestore getVoteCount error:', error.message);
      // Fall through to in-memory storage
    }
  }

  // In-memory fallback
  return inMemoryVotes.length;
}

/**
 * Check if Firestore is connected
 * @returns {boolean}
 */
function isFirestoreConnected() {
  return db !== null;
}

/**
 * Get the stop words set (for testing)
 * @returns {Set<string>}
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
  saveVote,
  getTopWords,
  getAllVotes,
  clearAllData,
  getVoteCount,
  isFirestoreConnected,
  getStopWords,
  // Export for testing
  _inMemoryVotes: inMemoryVotes,
  _inMemoryWordCounts: inMemoryWordCounts,
};
