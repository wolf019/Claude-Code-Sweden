'use strict';

const request = require('supertest');
const { app } = require('../src/app');

describe('App', () => {
  describe('GET /', () => {
    it('should serve index.html with 200 status', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Live Wordcloud');
    });
  });

  describe('GET /css/styles.css', () => {
    it('should serve styles.css with 200 status', async () => {
      const response = await request(app).get('/css/styles.css');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/css');
      expect(response.text).toContain('Lazer Wave');
    });
  });

  describe('GET /js/client.js', () => {
    it('should serve client.js with 200 status', async () => {
      const response = await request(app).get('/js/client.js');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/javascript');
    });
  });

  describe('GET /health', () => {
    it('should return 200 with ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
