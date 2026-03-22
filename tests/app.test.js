const request = require('supertest');
const app = require('../app'); 
const bcrypt = require('bcrypt');
const db = require('../db/queries'); 

describe('GET / (Index Page)', () => {
  
  // Define a consistent test user
  const testUser = {
    email: 'testing123@email.com',
    password: 'password123',
    age: 25,
    bio: 'Test bio'
  };

  // 1. Setup: Ensure the user exists in the DB before any tests run
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(testUser.password, 1); // 1 round for speed
    
    try {
      // Matches your queries.js insertUser({ email, password, age, bio })
      await db.insertUser({ 
        ...testUser,
        password: hashedPassword 
      });
    } catch (err) {
      // If user already exists (e.g. from a previous failed run), just move on
    }
  });

  describe('General Content on Home/Clubs Page', () => {
    it('should render the main title and "Add New Club" link', async () => {
      const res = await request(app).get('/clubs');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('<h1>SquadVault</h1>');
      expect(res.text).toContain('href="/clubs/new"');
    });

    it('should iterate through and display the list of clubs', async () => {
      const res = await request(app).get('/clubs');
      
      // These pass assuming your test DB has these clubs seeded
      expect(res.text).toContain('<strong>Arsenal</strong>');
      expect(res.text).toContain('Emirates Stadium');
      expect(res.text).toContain('href="/clubs/');
    });
  });

  describe('Authentication States', () => {
    it('should show Login and Signup links when NO user is logged in', async () => {
      const res = await request(app).get('/clubs');
      
      expect(res.text).toContain('href="/auth/login"');
      expect(res.text).toContain('href="/auth/signup"');
      expect(res.text).not.toContain('Logout');
    });

    it("should show Welcome message and Logout link when a user IS logged in", async () => {
      const agent = request.agent(app);

      // 1. Log in (sends 'jwt' cookie back to the agent)
      const loginRes = await agent
        .post('/auth/login')
        .type('form') 
        .send({ 
          email: testUser.email, 
          password: testUser.password 
        });

      // 2. Expect a redirect (302) if login is successful
      expect(loginRes.status).toBe(302);

      // 3. Request the page using the agent (which now carries the cookie)
      const res = await agent.get('/clubs');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Welcome');
      expect(res.text).toContain('href="/auth/logout"');
      expect(res.text).not.toContain('href="/auth/login"'); 
    });
  });
});