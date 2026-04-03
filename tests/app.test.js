const request = require('supertest');
const app = require('../app'); 
const pool = require('../db/pool');

describe('GET / (Index Page)', () => {
  
  const seededUser = {
    email: 'new@gmail.com', 
    password: 'password123'
  };

  afterAll(async () => {
    // Keep this to ensure the file-specific connection closes
    await pool.end();
  });

  describe('General Content on Home/Clubs Page', () => {
    it('should render the main title and "Add New Club" link', async () => {
      const res = await request(app).get('/clubs');
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('SquadVault');
      expect(res.text).toContain('href="/clubs/new"');
    });

    it('should iterate through and display the list of clubs from seed data', async () => {
      const res = await request(app).get('/clubs');
      
      // These strings match exactly what is in your populateDB.js SQL script
      expect(res.text).toContain('Arsenal');
      expect(res.text).toContain('Emirates Stadium');
      expect(res.text).toContain('Chelsea');
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

      // Log in using the user we know exists from the seed file
      const loginRes = await agent
        .post('/auth/login')
        .type('form') 
        .send({ 
          email: seededUser.email, 
          password: seededUser.password 
        });

      expect(loginRes.status).toBe(302);

      const res = await agent.get('/clubs');

      expect(res.status).toBe(200);
      expect(res.text).toMatch(/Welcome/i);
      expect(res.text).toContain('href="/auth/logout"');
    });
  });
});