const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app');
const pool = require('../db/pool');
const testHelper = require('./testHelper');

describe('App Routes', () => {
  const seededUser = {
    email: 'new@gmail.com',
    password: 'password123'
  };

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /', () => {
    it('should serve the built React app and its entry script', async () => {
      const builtHtml = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toBe(builtHtml);
      expect(res.text).toContain('<div id="root"></div>');

      const entryScript = res.text.match(/<script\b[^>]*src="([^"]+)"/);
      expect(entryScript).not.toBeNull();
      const asset = await request(app).get(entryScript[1]);
      expect(asset.status).toBe(200);
      expect(asset.headers['content-type']).toMatch(/javascript/);
    });
  });

  describe('GET /clubs', () => {
    it('should return a list of clubs as JSON', async () => {
      const res = await request(app).get('/clubs');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some(c => c.name === 'Arsenal')).toBe(true);
      expect(res.body.some(c => c.name === 'Chelsea')).toBe(true);
    });
  });

  describe('GET /auth/me', () => {
    it('should return null user when not logged in', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.user).toBeNull();
    });

    it('should return user info when logged in', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent.get('/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.user).not.toBeNull();
      expect(res.body.user.email).toBe(seededUser.email);
    });
  });
});
