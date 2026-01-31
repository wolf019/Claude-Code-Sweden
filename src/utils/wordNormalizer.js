'use strict';

/**
 * Word normalization and validation utilities
 * Handles sanitization and validation for vote submissions
 */

// Regex to match emojis and special characters
// Allows: alphanumeric, spaces, basic punctuation (.,!?'-), Swedish/Nordic characters
const ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9\s.,!?'\-åäöÅÄÖéÉèÈüÜ]/g;

/**
 * Normalize a word by trimming whitespace, removing special characters,
 * and converting to uppercase for wordcloud visual impact
 * @param {string} word - The word to normalize
 * @returns {string} - The normalized word in UPPERCASE
 */
function normalizeWord(word) {
  if (typeof word !== 'string') {
    return '';
  }

  // Trim whitespace
  let normalized = word.trim();

  // Remove emojis and special characters
  normalized = normalized.replace(ALLOWED_CHARS_REGEX, '');

  // Collapse multiple spaces into single space
  normalized = normalized.replace(/\s+/g, ' ');

  // Trim again in case removal created leading/trailing spaces
  normalized = normalized.trim();

  // Convert to uppercase for visual impact in wordcloud
  normalized = normalized.toUpperCase();

  return normalized;
}

/**
 * Validate a word meets the requirements
 * @param {string} word - The word to validate (should be normalized first)
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
function validateWord(word) {
  if (typeof word !== 'string') {
    return { valid: false, error: 'Word must be a string' };
  }

  const trimmed = word.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Word cannot be empty' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Word must be 50 characters or less' };
  }

  return { valid: true };
}

module.exports = {
  normalizeWord,
  validateWord,
};
