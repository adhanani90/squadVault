// tests/auth.test.js
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
  const seededEmail = 'new@gmail.com'; // From your populateDB.js

// Cleanup DB after each test so we can reuse the same email
    afterEach(async () => {
        await deleteTestUser(testEmail);
    });

  describe('Signup Logic', () => {
    it("should redirect when signup is successful", async () => {
      // UTILIZING HELPER: signupUser does the POST for us
      const res = await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });
      
      expect(res.status).toBe(302);
    });

    it("should fail when passwords don't match", async () => {
      const res = await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: 'wrongpassword',
        age: 25,
        bio: 'Hello'
      });
      
      expectValidationError(res, 'Passwords do not match');
    });

    it("should fail when password is too short", async () => {
      // needs to be at least 6 characters
      const res = await signupUser({
        email: testEmail,
        password: '12345',
        confirmPassword: '12345',
        age: 25,
        bio: 'Hello'
      });
      
      expectValidationError(res, 'Password must be 6-255 characters');
    });

    it("should fail when email already exists", async () => {
      // 1. Create the user so they can log in
      await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });

      // 2. Try to create the user again
      const res = await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });

      expectValidationError(res, 'Email already exists');

    })


  });

  describe('Login & Session Logic', () => {
    it("should login successfully and access a protected route", async () => {
      // 1. First, create the user so they can log in
      await signupUser({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        age: 25,
        bio: 'Hello'
      });

      // 2. UTILIZING HELPER: loginUser returns the 'agent' with the cookie
      const { res, agent } = await loginUser(testEmail, testPassword);
      expect(res.status).toBe(302);

      // 3. Test if the session actually works
      const profileRes = await agent.get('/clubs/new'); // Protected route that requires auth
      expect(profileRes.status).toBe(200);
    });

    it("should fail to login with incorrect password", async () => {
      const { res } = await loginUser(testEmail, 'wrongpassword');
      expect(res.status).toBe(401);
      expectValidationError(res, 'Email or password is incorrect');
    });


    it("should logout successfully", async () => {
      const { agent } = await loginUser(seededEmail, 'password123');
      
      // UTILIZING HELPER: logoutUser
      const res = await logoutUser(agent);
      expect(res.status).toBe(302);
    });
  });
});