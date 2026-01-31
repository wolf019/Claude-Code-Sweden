'use strict';

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const { normalizeWord, validateWord } = require('../src/utils/wordNormalizer');

describe('Socket.io Integration', () => {
  let server;
  let io;
  let port;
  let connectedClients;
  let sessionData;
  let rateLimitMap;
  const RATE_LIMIT_MS = 5000;

  beforeAll((done) => {
    // Reset session data for each test suite
    sessionData = {
      question: 'What is your favorite color?',
      votes: [],
      participants: new Set(),
    };
    rateLimitMap = new Map();
    connectedClients = 0;

    // Create isolated server for Socket.io tests
    const app = express();
    const httpServer = createServer(app);
    io = new Server(httpServer, {
      cors: { origin: '*' },
      transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
      connectedClients++;
      io.emit('connection-count', { count: connectedClients });

      // Handle join event
      socket.on('join', (data) => {
        const name = data && typeof data.name === 'string' ? data.name.trim() : '';

        if (name.length < 2 || name.length > 50) {
          socket.emit('join-error', { message: 'Name must be 2-50 characters' });
          return;
        }

        socket.userName = name;
        sessionData.participants.add(socket.id);

        socket.emit('join-success', {
          name: name,
          question: sessionData.question,
        });
      });

      // Handle vote event
      socket.on('vote', (data) => {
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

        const rawWord = data && typeof data.word === 'string' ? data.word : '';
        const normalizedWord = normalizeWord(rawWord);
        const validation = validateWord(normalizedWord);

        if (!validation.valid) {
          socket.emit('vote-error', { message: validation.error });
          return;
        }

        // Normalize to uppercase for storage (like the real implementation)
        const storedWord = normalizedWord.toUpperCase();
        sessionData.votes.push({
          word: storedWord,
          timestamp: new Date(),
          participantId: socket.id,
        });

        rateLimitMap.set(socket.id, now);
        socket.emit('vote-success', { word: storedWord });
        io.emit('wordcloud-updated', { votes: sessionData.votes });
      });

      socket.on('disconnect', () => {
        connectedClients--;
        io.emit('connection-count', { count: connectedClients });
        rateLimitMap.delete(socket.id);
        sessionData.participants.delete(socket.id);
      });
    });

    server = httpServer.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    server.close(done);
  });

  beforeEach(() => {
    // Reset session data before each test
    sessionData.votes = [];
    sessionData.participants.clear();
    rateLimitMap.clear();
  });

  describe('Connection', () => {
    it('should allow client to connect via WebSocket', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.disconnect();
        done();
      });
    });

    it('should allow client to connect via polling', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['polling'],
      });

      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.disconnect();
        done();
      });
    });

    it('should broadcast connection count on connect', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connection-count', (data) => {
        expect(data).toHaveProperty('count');
        expect(typeof data.count).toBe('number');
        client.disconnect();
        done();
      });
    });

    it('should handle client disconnect', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.disconnect();
      });

      client.on('disconnect', () => {
        expect(client.connected).toBe(false);
        done();
      });
    });
  });

  describe('Join Session', () => {
    it('should allow valid name to join', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: 'TestUser' });
      });

      client.on('join-success', (data) => {
        expect(data.name).toBe('TestUser');
        expect(data.question).toBeDefined();
        client.disconnect();
        done();
      });
    });

    it('should reject empty name', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: '' });
      });

      client.on('join-error', (data) => {
        expect(data.message).toContain('2-50 characters');
        client.disconnect();
        done();
      });
    });

    it('should reject name shorter than 2 characters', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: 'A' });
      });

      client.on('join-error', (data) => {
        expect(data.message).toContain('2-50 characters');
        client.disconnect();
        done();
      });
    });

    it('should trim whitespace from name', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: '  ValidName  ' });
      });

      client.on('join-success', (data) => {
        expect(data.name).toBe('ValidName');
        client.disconnect();
        done();
      });
    });
  });

  describe('Vote Submission', () => {
    it('should accept valid vote after joining', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: 'Voter' });
      });

      client.on('join-success', () => {
        client.emit('vote', { word: 'happiness' });
      });

      client.on('vote-success', (data) => {
        expect(data.word).toBe('HAPPINESS');
        client.disconnect();
        done();
      });
    });

    it('should reject vote without joining first', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('vote', { word: 'test' });
      });

      client.on('vote-error', (data) => {
        expect(data.message).toContain('join the session first');
        client.disconnect();
        done();
      });
    });

    it('should reject empty word', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: 'Voter' });
      });

      client.on('join-success', () => {
        client.emit('vote', { word: '' });
      });

      client.on('vote-error', (data) => {
        expect(data.message).toContain('empty');
        client.disconnect();
        done();
      });
    });

    it('should normalize words by stripping emojis', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: 'Voter' });
      });

      client.on('join-success', () => {
        client.emit('vote', { word: 'hello🎉world' });
      });

      client.on('vote-success', (data) => {
        expect(data.word).toBe('HELLOWORLD');
        client.disconnect();
        done();
      });
    });

    it('should broadcast wordcloud-updated after vote', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join', { name: 'Voter' });
      });

      client.on('join-success', () => {
        client.emit('vote', { word: 'testword' });
      });

      client.on('wordcloud-updated', (data) => {
        expect(data.votes).toBeDefined();
        expect(Array.isArray(data.votes)).toBe(true);
        client.disconnect();
        done();
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on rapid votes', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      let voteCount = 0;
      let errorReceived = false;

      client.on('connect', () => {
        client.emit('join', { name: 'RapidVoter' });
      });

      client.on('join-success', () => {
        // Submit first vote
        client.emit('vote', { word: 'first' });
      });

      client.on('vote-success', () => {
        voteCount++;
        if (voteCount === 1) {
          // Immediately try second vote (should be rate limited)
          client.emit('vote', { word: 'second' });
        }
      });

      client.on('vote-error', (data) => {
        if (!errorReceived) {
          errorReceived = true;
          expect(data.message).toContain('wait');
          expect(data.message).toContain('seconds');
          client.disconnect();
          done();
        }
      });
    });
  });
});

describe('Word Normalizer', () => {
  describe('normalizeWord', () => {
    it('should trim whitespace', () => {
      expect(normalizeWord('  hello  ')).toBe('HELLO');
    });

    it('should remove emojis', () => {
      expect(normalizeWord('hello🎉world')).toBe('HELLOWORLD');
      expect(normalizeWord('test😀')).toBe('TEST');
    });

    it('should allow alphanumeric characters', () => {
      expect(normalizeWord('Hello123')).toBe('HELLO123');
    });

    it('should allow Swedish characters', () => {
      expect(normalizeWord('åäöÅÄÖ')).toBe('ÅÄÖÅÄÖ');
    });

    it('should allow basic punctuation', () => {
      expect(normalizeWord("Hello, world!")).toBe("HELLO, WORLD!");
      expect(normalizeWord("It's fine")).toBe("IT'S FINE");
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeWord('hello    world')).toBe('HELLO WORLD');
    });

    it('should handle non-string input', () => {
      expect(normalizeWord(null)).toBe('');
      expect(normalizeWord(undefined)).toBe('');
      expect(normalizeWord(123)).toBe('');
    });

    it('should remove special characters', () => {
      expect(normalizeWord('hello@world#test')).toBe('HELLOWORLDTEST');
      expect(normalizeWord('test$%^&*()')).toBe('TEST');
    });
  });

  describe('validateWord', () => {
    it('should accept valid words', () => {
      expect(validateWord('hello').valid).toBe(true);
      expect(validateWord('a').valid).toBe(true);
    });

    it('should reject empty words', () => {
      const result = validateWord('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject words longer than 50 characters', () => {
      const longWord = 'a'.repeat(51);
      const result = validateWord(longWord);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('50 characters');
    });

    it('should accept 50 character word', () => {
      const word = 'a'.repeat(50);
      expect(validateWord(word).valid).toBe(true);
    });

    it('should handle non-string input', () => {
      expect(validateWord(null).valid).toBe(false);
      expect(validateWord(undefined).valid).toBe(false);
    });
  });
});
