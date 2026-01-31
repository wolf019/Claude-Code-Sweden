'use strict';

const {
  isStopWord,
  normalizeForStorage,
  saveVote,
  getTopWords,
  clearAllData,
  getVoteCount,
  getStopWords,
} = require('../src/utils/database');

describe('Database Module', () => {
  // Clear data before each test
  beforeEach(async () => {
    await clearAllData();
  });

  describe('isStopWord', () => {
    it('should identify common stop words', () => {
      expect(isStopWord('the')).toBe(true);
      expect(isStopWord('a')).toBe(true);
      expect(isStopWord('an')).toBe(true);
      expect(isStopWord('is')).toBe(true);
      expect(isStopWord('are')).toBe(true);
      expect(isStopWord('and')).toBe(true);
      expect(isStopWord('or')).toBe(true);
      expect(isStopWord('but')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isStopWord('THE')).toBe(true);
      expect(isStopWord('The')).toBe(true);
      expect(isStopWord('AND')).toBe(true);
    });

    it('should return false for non-stop words', () => {
      expect(isStopWord('innovation')).toBe(false);
      expect(isStopWord('technology')).toBe(false);
      expect(isStopWord('cloud')).toBe(false);
    });

    it('should handle non-string input', () => {
      expect(isStopWord(null)).toBe(false);
      expect(isStopWord(undefined)).toBe(false);
      expect(isStopWord(123)).toBe(false);
    });
  });

  describe('normalizeForStorage', () => {
    it('should convert to uppercase', () => {
      expect(normalizeForStorage('innovation')).toBe('INNOVATION');
      expect(normalizeForStorage('Innovation')).toBe('INNOVATION');
    });

    it('should strip punctuation', () => {
      expect(normalizeForStorage("cloud's")).toBe('CLOUDS');
      expect(normalizeForStorage('hello!')).toBe('HELLO');
      expect(normalizeForStorage('test.')).toBe('TEST');
    });

    it('should trim whitespace', () => {
      expect(normalizeForStorage('  cloud  ')).toBe('CLOUD');
    });

    it('should handle non-string input', () => {
      expect(normalizeForStorage(null)).toBe('');
      expect(normalizeForStorage(undefined)).toBe('');
    });
  });

  describe('saveVote', () => {
    it('should save a vote and return normalized word', async () => {
      const result = await saveVote('innovation', 'session123');
      expect(result.success).toBe(true);
      expect(result.word).toBe('INNOVATION');
    });

    it('should normalize words to uppercase', async () => {
      const result1 = await saveVote('Innovation', 'session1');
      const result2 = await saveVote('INNOVATION', 'session2');
      const result3 = await saveVote('innovation', 'session3');

      expect(result1.word).toBe('INNOVATION');
      expect(result2.word).toBe('INNOVATION');
      expect(result3.word).toBe('INNOVATION');
    });

    it('should increment word counts', async () => {
      await saveVote('cloud', 'session1');
      await saveVote('cloud', 'session2');
      await saveVote('cloud', 'session3');

      const topWords = await getTopWords(10);
      const cloudEntry = topWords.find((entry) => entry[0] === 'CLOUD');
      expect(cloudEntry[1]).toBe(3);
    });
  });

  describe('getTopWords', () => {
    it('should return empty array when no votes', async () => {
      const topWords = await getTopWords(10);
      expect(topWords).toEqual([]);
    });

    it('should return words sorted by count descending', async () => {
      await saveVote('cloud', 'session1');
      await saveVote('cloud', 'session2');
      await saveVote('innovation', 'session3');

      const topWords = await getTopWords(10);
      expect(topWords[0][0]).toBe('CLOUD');
      expect(topWords[0][1]).toBe(2);
      expect(topWords[1][0]).toBe('INNOVATION');
      expect(topWords[1][1]).toBe(1);
    });

    it('should respect limit parameter', async () => {
      await saveVote('word1', 'session1');
      await saveVote('word2', 'session2');
      await saveVote('word3', 'session3');

      const topWords = await getTopWords(2);
      expect(topWords.length).toBe(2);
    });
  });

  describe('clearAllData', () => {
    it('should clear all votes and word counts', async () => {
      await saveVote('innovation', 'session1');
      await saveVote('cloud', 'session2');

      let voteCount = await getVoteCount();
      expect(voteCount).toBe(2);

      await clearAllData();

      voteCount = await getVoteCount();
      expect(voteCount).toBe(0);

      const topWords = await getTopWords(10);
      expect(topWords).toEqual([]);
    });
  });

  describe('getVoteCount', () => {
    it('should return correct vote count', async () => {
      expect(await getVoteCount()).toBe(0);

      await saveVote('innovation', 'session1');
      expect(await getVoteCount()).toBe(1);

      await saveVote('cloud', 'session2');
      expect(await getVoteCount()).toBe(2);
    });
  });

  describe('Case-insensitive aggregation', () => {
    it('should count "Innovation" and "innovation" together', async () => {
      await saveVote('Innovation', 'session1');
      await saveVote('innovation', 'session2');
      await saveVote('INNOVATION', 'session3');

      const topWords = await getTopWords(10);
      expect(topWords.length).toBe(1);
      expect(topWords[0][0]).toBe('INNOVATION');
      expect(topWords[0][1]).toBe(3);
    });
  });

  describe('getStopWords', () => {
    it('should return the stop words set', () => {
      const stopWords = getStopWords();
      expect(stopWords).toBeInstanceOf(Set);
      expect(stopWords.has('the')).toBe(true);
      expect(stopWords.has('and')).toBe(true);
    });
  });
});
