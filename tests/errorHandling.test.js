// tests/errorHandling.test.js

const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const testHelper = require('./testHelper');
const populateDB = require('../db/populateDB');

describe('Error Handling & Edge Cases', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await populateDB();
  });

  describe('Auth Middleware - Invalid JWT', () => {
    it('should return 401 when token is invalid on a protected route', async () => {
      const res = await request(app)
        .post('/clubs')
        .set('Cookie', 'jwt=invalid.token.here')
        .send({ name: 'Test Club', stadium: 'Test Stadium', country: 'England' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when hitting a protected route with a malformed token', async () => {
      const res = await request(app)
        .post('/players')
        .set('Cookie', 'jwt=malformed');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Club Routes - Error Scenarios', () => {
    it('should return 404 when club does not exist', async () => {
      const res = await request(app).get('/clubs/9999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Club not found');
    });

    it('should return 404 when updating a non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      const res = await agent
        .post('/clubs/9999/update')
        .send({ name: 'New Name', stadium: 'New Stadium', country: 'Spain' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Club not found');
    });

    it('should return 200 when deleting a non-existent club (idempotent)', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      const res = await agent.post('/clubs/9999/delete');
      expect(res.status).toBe(200);
    });
  });

  describe('Player Routes - Error Scenarios', () => {
    it('should return 400 when creating a player with validation errors', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      const res = await agent
        .post('/players')
        .send({ firstName: '', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when creating a player with a non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      const res = await agent
        .post('/players')
        .send({ firstName: 'John', lastName: 'Doe', position: 'Midfielder', nationality: 'France', clubId: 9999, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(400);
    });

    it('should return 404 when updating a non-existent player', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      const res = await agent
        .post('/players/9999/update')
        .send({ firstName: 'John', lastName: 'Doe', position: 'Midfielder', nationality: 'France', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(404);
    });

    it('should return 400 when updating a player with a non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      const res = await agent
        .post('/players/1/update')
        .send({ firstName: 'Bukayo', lastName: 'Saka', position: 'Attacker', nationality: 'England', clubId: 9999, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(400);
    });
  });

  describe('Global Error Handler', () => {
    it('should respond to the root route without crashing', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(302);
    });
  });

  describe('Auth Edge Cases', () => {
    it('should return 401 when password is missing in login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'new@gmail.com' });
      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent user login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@gmail.com', password: 'password123' });
      expect(res.status).toBe(401);
      expect(res.body.errors[0].msg).toContain('Email or password is incorrect');
    });
  });
});
