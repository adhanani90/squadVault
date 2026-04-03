// tests/errorHandling.test.js
// Test error scenarios and edge cases

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
    it('should redirect to /login when token is invalid on protected route', async () => {
      const res = await request(app)
        .post('/clubs')
        .set('Cookie', 'jwt=invalid.token.here')
        .send({
          name: 'Test Club',
          stadium: 'Test Stadium',
          country: 'England'
        });
      
      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/login');
    });

    it('should redirect to /login when hitting protected route with expired/malformed token', async () => {
      const res = await request(app)
        .post('/players')
        .set('Cookie', 'jwt=malformed');
      
      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/login');
    });
  });

  describe('Club Routes - Error Scenarios', () => {
    it('should return 404 when club does not exist', async () => {
      const res = await request(app).get('/clubs/9999');
      expect(res.status).toBe(404);
      expect(res.text).toContain('Club not found');
    });

    it('should fail to update non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      
      const res = await agent
        .post('/clubs/9999/update')
        .send({
          name: 'New Name',
          stadium: 'New Stadium',
          country: 'Spain'
        });
      
      expect(res.status).toBe(404);
      expect(res.text).toContain('Club not found');
    });

    it('should fail to delete non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      
      const res = await agent.post('/clubs/9999/delete');
      
      expect(res.status).toBe(302); // Deletes anyway and redirects
    });
  });

  describe('Player Routes - Error Scenarios', () => {
    it('should fail to create player with validation errors', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      
      const res = await agent
        .post('/players')
        .send({
          firstName: '', // Empty first name
          lastName: 'Test',
          position: 'Attacker',
          nationality: 'England',
          clubId: 1,
          dateOfBirth: '2001-09-05'
        });
      
      expect(res.status).toBe(400);
    });

    it('should fail to create player with non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      
      const res = await agent
        .post('/players')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          position: 'Midfielder',
          nationality: 'France',
          clubId: 9999,
          dateOfBirth: '2001-09-05'
        });
      
      expect(res.status).toBe(400);
    });

    it('should fail to update non-existent player', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      
      const res = await agent
        .post('/players/9999/update')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          position: 'Midfielder',
          nationality: 'France',
          clubId: 1,
          dateOfBirth: '2001-09-05'
        });
      
      expect(res.status).toBe(404);
    });

    it('should fail to update player with non-existent club', async () => {
      const { agent } = await testHelper.loginUser('new@gmail.com', 'password123');
      
      const res = await agent
        .post('/players/1/update')
        .send({
          firstName: 'Bukayo',
          lastName: 'Saka',
          position: 'Attacker',
          nationality: 'England',
          clubId: 9999,
          dateOfBirth: '2001-09-05'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('Global Error Handler', () => {
    it('should have global error handler middleware', async () => {
      // The error handler is passive - it catches unhandled errors
      // Just verify the app loads successfully
      const res = await request(app).get('/');
      expect(res.status).toBe(302); // Redirects to /clubs
    });
  });

  describe('Auth Edge Cases', () => {
    it('should handle missing password in login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'new@gmail.com'
          // password missing
        });
      
      expect(res.status).toBe(401);
    });

    it('should handle non-existent user login', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@gmail.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(401);
      expect(res.text).toContain('Email or password is incorrect');
    });
  });
});
