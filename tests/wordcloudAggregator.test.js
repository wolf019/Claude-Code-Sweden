'use strict';

const {
  aggregateWordFrequencies,
  getTopWords,
  buildWordcloudData,
} = require('../src/utils/wordcloudAggregator');

describe('Wordcloud Aggregator', () => {
  describe('aggregateWordFrequencies', () => {
    it('should return empty object for empty votes array', () => {
      expect(aggregateWordFrequencies([])).toEqual({});
    });

    it('should return empty object for null/undefined input', () => {
      expect(aggregateWordFrequencies(null)).toEqual({});
      expect(aggregateWordFrequencies(undefined)).toEqual({});
    });

    it('should count word frequencies correctly', () => {
      const votes = [
        { word: 'hello', timestamp: new Date() },
        { word: 'world', timestamp: new Date() },
        { word: 'hello', timestamp: new Date() },
      ];
      expect(aggregateWordFrequencies(votes)).toEqual({
        HELLO: 2,
        WORLD: 1,
      });
    });

    it('should be case-insensitive', () => {
      const votes = [
        { word: 'Hello', timestamp: new Date() },
        { word: 'HELLO', timestamp: new Date() },
        { word: 'hello', timestamp: new Date() },
      ];
      expect(aggregateWordFrequencies(votes)).toEqual({
        HELLO: 3,
      });
    });

    it('should skip votes without word property', () => {
      const votes = [
        { word: 'test', timestamp: new Date() },
        { noWord: 'ignored' },
        null,
        { word: 'test', timestamp: new Date() },
      ];
      expect(aggregateWordFrequencies(votes)).toEqual({
        TEST: 2,
      });
    });
  });

  describe('getTopWords', () => {
    it('should return empty array for empty frequencies', () => {
      expect(getTopWords({})).toEqual([]);
    });

    it('should sort by count descending', () => {
      const frequencies = { apple: 5, banana: 10, cherry: 3 };
      const result = getTopWords(frequencies);
      expect(result).toEqual([
        ['banana', 10],
        ['apple', 5],
        ['cherry', 3],
      ]);
    });

    it('should limit results to specified count', () => {
      const frequencies = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const result = getTopWords(frequencies, 3);
      expect(result).toEqual([
        ['e', 5],
        ['d', 4],
        ['c', 3],
      ]);
    });

    it('should default to top 50 words', () => {
      const frequencies = {};
      for (let i = 0; i < 100; i++) {
        frequencies[`word${i}`] = i;
      }
      const result = getTopWords(frequencies);
      expect(result.length).toBe(50);
      expect(result[0][1]).toBe(99); // Highest count first
    });
  });

  describe('buildWordcloudData', () => {
    it('should return empty data for empty votes', () => {
      const result = buildWordcloudData([]);
      expect(result.words).toEqual([]);
      expect(result.frequencies).toEqual({});
    });

    it('should aggregate and sort votes correctly', () => {
      const votes = [
        { word: 'innovation', timestamp: new Date() },
        { word: 'creativity', timestamp: new Date() },
        { word: 'innovation', timestamp: new Date() },
        { word: 'innovation', timestamp: new Date() },
        { word: 'creativity', timestamp: new Date() },
      ];
      const result = buildWordcloudData(votes);
      expect(result.words).toEqual([
        ['INNOVATION', 3],
        ['CREATIVITY', 2],
      ]);
      expect(result.frequencies).toEqual({
        INNOVATION: 3,
        CREATIVITY: 2,
      });
    });

    it('should respect limit parameter', () => {
      const votes = [
        { word: 'a' },
        { word: 'b' },
        { word: 'b' },
        { word: 'c' },
        { word: 'c' },
        { word: 'c' },
      ];
      const result = buildWordcloudData(votes, 2);
      expect(result.words).toEqual([
        ['C', 3],
        ['B', 2],
      ]);
    });
  });
});
