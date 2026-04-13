// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const {
  signupUser,
  loginUser,
  logoutUser,
  deleteTestUser,
  expectValidationError
} = require('./testHelper');

describe('Testing Auth Routes', () => {
  const testEmail = 'api-test@gmail.com';
  const testPassword = 'password123';
  const seededEmail = 'new@gmail.com';

  afterEach(async () => {
    await deleteTestUser(testEmail);
  });

  describe('Signup Logic', () => {
    it('should return 201 when signup is successful', async () => {
      const res = await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(testEmail);
    });

    it("should return 400 when passwords don't match", async () => {
      const res = await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: 'wrongpassword',
        age: 25,
        bio: 'Hello'
      });
      expect(res.status).toBe(400);
      expectValidationError(res, 'Passwords do not match');
    });

    it('should return 400 when password is too short', async () => {
      const res = await signupUser({
        email: testEmail,
        password: '12345',
        confirmPassword: '12345',
        age: 25,
        bio: 'Hello'
      });
      expect(res.status).toBe(400);
      expectValidationError(res, 'Password must be 6-255 characters');
    });

    it('should return 400 when email already exists', async () => {
      await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });

      const res = await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });
      expect(res.status).toBe(400);
      expectValidationError(res, 'Email already exists');
    });
  });

  describe('Login & Session Logic', () => {
    it('should return 200 and user data on successful login', async () => {
      await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });

      const { res, agent } = await loginUser(testEmail, testPassword);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testEmail);

      // Cookie is set — /auth/me should return the user
      const meRes = await agent.get('/auth/me');
      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe(testEmail);
    });

    it('should return 401 with incorrect password', async () => {
      const { res } = await loginUser(testEmail, 'wrongpassword');
      expect(res.status).toBe(401);
      expectValidationError(res, 'Email or password is incorrect');
    });

    it('should logout successfully and clear the session', async () => {
      const { agent } = await loginUser(seededEmail, 'password123');
      const res = await logoutUser(agent);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out');
    });
  });
});
