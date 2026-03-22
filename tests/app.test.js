const request = require('supertest');
const app = require('../app'); 
const bcrypt = require('bcrypt');
const db = require('../db/queries'); 
const pool = require('../db/pool'); // Added to close connection later

describe('GET / (Index Page)', () => {
  
const testUser = {
    email: 'jest_tester@gmail.com', // A unique email just for this test
    password: 'password123',
    age: 25,
    bio: 'Tester'
  };
  beforeAll(async () => {
    try {
      // We hash it here so the controller's bcrypt.compare() will work
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await db.insertUser({ 
        ...testUser,
        password: hashedPassword 
      });
    } catch (err) {
      // If user exists, that's fine
    }
  });

  // Teardown: Close the database connection pool so Jest can exit cleanly
  afterAll(async () => {
    await pool.end();
  });

  describe('General Content on Home/Clubs Page', () => {
    it('should render the main title and "Add New Club" link', async () => {
      const res = await request(app).get('/clubs');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('<h1>SquadVault</h1>');
      expect(res.text).toContain('href="/clubs/new"');
    });

    it('should iterate through and display the list of clubs from seed data', async () => {
      const res = await request(app).get('/clubs');
      
      // These strings match exactly what is in your populateDB.js SQL script
      expect(res.text).toContain('<strong>Arsenal</strong>');
      expect(res.text).toContain('Emirates Stadium');
      expect(res.text).toContain('<strong>Chelsea</strong>');
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

      // 1. Log in
      const loginRes = await agent
        .post('/auth/login')
        .type('form') 
        .send({ 
          email: testUser.email, 
          password: testUser.password 
        });

      // 2. Expect a redirect (302) to /clubs or / after login
      expect(loginRes.status).toBe(302);

      // 3. Request the page using the agent
      const res = await agent.get('/clubs');

      expect(res.status).toBe(200);
      // Using a Case-Insensitive regex check for "Welcome" is safer
      expect(res.text).toMatch(/Welcome/i);
      expect(res.text).toContain('href="/auth/logout"');
    });
  });
});