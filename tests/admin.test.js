'use strict';

const request = require('supertest');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const adminRoutes = require('../src/routes/admin');
const { sessionData, resetSession } = require('../src/utils/storage');

describe('Admin Endpoints', () => {
  let app;
  let httpServer;
  let io;
  let port;

  beforeAll((done) => {
    app = express();
    app.use(express.json());
    httpServer = createServer(app);
    io = new Server(httpServer, {
      cors: { origin: '*' },
      transports: ['websocket', 'polling'],
    });
    app.set('io', io);
    app.use('/admin', adminRoutes);

    httpServer.listen(0, () => {
      port = httpServer.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  beforeEach(() => {
    resetSession();
    sessionData.question = '';
  });

  describe('POST /admin/question', () => {
    it('should set the active question', async () => {
      const res = await request(app)
        .post('/admin/question')
        .send({ question: 'What is your favorite color?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.question).toBe('What is your favorite color?');
      expect(sessionData.question).toBe('What is your favorite color?');
    });

    it('should trim whitespace from question', async () => {
      const res = await request(app)
        .post('/admin/question')
        .send({ question: '  Trimmed question  ' });

      expect(res.status).toBe(200);
      expect(res.body.question).toBe('Trimmed question');
    });

    it('should return 400 if question is missing', async () => {
      const res = await request(app).post('/admin/question').send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 if question is not a string', async () => {
      const res = await request(app)
        .post('/admin/question')
        .send({ question: 123 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should emit question-updated event to all clients', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.on('question-updated', (data) => {
          expect(data.question).toBe('Real-time test question');
          client.disconnect();
          done();
        });

        request(app)
          .post('/admin/question')
          .send({ question: 'Real-time test question' })
          .then(() => {});
      });
    });
  });

  describe('POST /admin/reset', () => {
    it('should clear all votes and return success', async () => {
      sessionData.votes = [{ word: 'test', timestamp: new Date() }];
      sessionData.participants.add('socket1');

      const res = await request(app).post('/admin/reset').send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Session reset successfully');
      expect(sessionData.votes).toHaveLength(0);
      expect(sessionData.participants.size).toBe(0);
    });

    it('should emit session-reset event to all clients', (done) => {
      const client = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.on('session-reset', (data) => {
          expect(data.timestamp).toBeDefined();
          client.disconnect();
          done();
        });

        request(app)
          .post('/admin/reset')
          .send()
          .then(() => {});
      });
    });
  });

  describe('GET /admin/stats', () => {
    it('should return participant and vote counts', async () => {
      sessionData.question = 'Test question';
      sessionData.votes = [
        { word: 'blue', timestamp: new Date() },
        { word: 'red', timestamp: new Date() },
      ];
      sessionData.participants.add('socket1');
      sessionData.participants.add('socket2');

      const res = await request(app).get('/admin/stats');

      expect(res.status).toBe(200);
      expect(res.body.participantCount).toBe(2);
      expect(res.body.voteCount).toBe(2);
      expect(res.body.currentQuestion).toBe('Test question');
    });

    it('should return zeros when no data exists', async () => {
      const res = await request(app).get('/admin/stats');

      expect(res.status).toBe(200);
      expect(res.body.participantCount).toBe(0);
      expect(res.body.voteCount).toBe(0);
      expect(res.body.currentQuestion).toBe('');
    });
  });
});
