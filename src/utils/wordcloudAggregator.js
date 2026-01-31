'use strict';

/**
 * Wordcloud Aggregator Utility
 * Aggregates votes into word frequency data for wordcloud rendering
 */

/**
 * Aggregate votes into word frequency counts
 * @param {Array} votes - Array of vote objects {word, timestamp, participantId}
 * @returns {Object} Word frequency map {word: count}
 */
function aggregateWordFrequencies(votes) {
  if (!Array.isArray(votes) || votes.length === 0) {
    return {};
  }

  const frequencies = {};
  for (const vote of votes) {
    if (vote && vote.word) {
      // Words are already normalized to uppercase by wordNormalizer
      const word = vote.word.toUpperCase();
      frequencies[word] = (frequencies[word] || 0) + 1;
    }
  }
  return frequencies;
}

/**
 * Get top N words sorted by frequency
 * @param {Object} frequencies - Word frequency map {word: count}
 * @param {number} limit - Maximum number of words to return (default: 50)
 * @returns {Array} Array of [word, count] tuples sorted by count descending
 */
function getTopWords(frequencies, limit = 50) {
  return Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

/**
 * Build complete wordcloud data from votes
 * Combines aggregation and sorting into a single function
 * @param {Array} votes - Array of vote objects {word, timestamp, participantId}
 * @param {number} limit - Maximum number of words to return (default: 50)
 * @returns {Object} Wordcloud data { words: [[word, count], ...], frequencies: {word: count} }
 */
function buildWordcloudData(votes, limit = 50) {
  const frequencies = aggregateWordFrequencies(votes);
  const words = getTopWords(frequencies, limit);
  return { words, frequencies };
}

module.exports = {
  aggregateWordFrequencies,
  getTopWords,
  buildWordcloudData,
};
