// tests/clubs.test.js

// this file will test the clubs routes

const request = require('supertest');
const app = require('../app');
const db = require('../db/queries');
const testHelper = require('./testHelper');
const populateDB = require('../db/populateDB');

describe('Clubs Routes', () => {
  const seededUser = {
    email: 'new@gmail.com',
    password: 'password123'
  };

  // Clean up after each test by reseeding database
  afterEach(async () => {
    await populateDB();
  });


  describe('GET /clubs', () => {
    it('should render the main title and "Add New Club" link', async () => {
      const res = await request(app).get('/clubs');

      expect(res.status).toBe(200);
      expect(res.text).toContain('<h1>SquadVault</h1>');
      expect(res.text).toContain('href="/clubs/new"');
    });

    it('should iterate through and display the list of clubs from seed data', async () => {
      const res = await request(app).get('/clubs');

      expect(res.text).toContain('Arsenal');
      expect(res.text).toContain('Emirates Stadium');
      expect(res.text).toContain('Chelsea');
    });
  });

  describe('GET /clubs/:clubId', () => {
    it('should render the club details and players at that club', async () => {
      const res = await request(app).get('/clubs/1');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Arsenal');
      expect(res.text).toContain('Bukayo Saka');
      expect(res.text).toContain('Martin Odegaard');
    });
  });

  describe('GET /clubs/new', () => {
    it('should render the create club form', async () => {
      const res = await request(app).get('/clubs/new');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Create a New Club');
      expect(res.text).toContain('submit');
    });
  });

    describe('POST /clubs', () => {
    const seededUser = { email: 'new@gmail.com', password: 'password123' };

    it('should fail as no auth', async () => {
        // Raw request without a logged-in agent should fail
        const res = await request(app)
            .post('/clubs')
            .send({ name: 'FC Test', country: 'England', stadium: 'Test Arena' });

        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/login');
    });

    it('should work now as we include auth via the agent', async () => {
        // 1. Log in and get the agent (which holds the JWT cookie)
        const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

        // 2. Use the agent to make the request instead of 'request(app)'
        const res = await agent
            .post('/clubs')
            .send({ 
                name: 'New Test Club', 
                country: 'Spain', 
                stadium: 'Estadio Test' 
            });

        // 3. Since it's a successful creation and likely redirects to the club list:
        expect(res.status).toBe(302); 
        expect(res.header.location).toBe('/clubs');
    });
  })


  describe('POST /clubs/:clubId/update', () => {
    // test the update routes

    it('should fail as no auth', async () => {
        // Raw request without a logged-in agent should fail
        const res = await request(app)
            .post('/clubs/1/update')
            .send({ name: 'FC Test', country: 'England', stadium: 'Test Arena' });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/login');
    });

    it('should work now as we include auth via the agent', async () => {
        // 1. Log in and get the agent (which holds the JWT cookie)
        const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

        // 2. Use the agent to make the request instead of 'request(app)'
        const res = await agent
            .post('/clubs/1/update')
            .send({ 
                name: 'New Test Club', 
                country: 'Spain', 
                stadium: 'Estadio Test' 
            });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/clubs');
    });

    it('should fail if the club does not exist', async () => {
        // 1. Log in and get the agent (which holds the JWT cookie)
        const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

        // 2. Use the agent to make the request instead of 'request(app)'
        const res = await agent
            .post('/clubs/100/update')
            .send({ 
                name: 'New Test Club', 
                country: 'Spain', 
                stadium: 'Estadio Test' 
            });
        expect(res.status).toBe(404);
    });

    it('should fail if name is already taken', async () => {
        // 1. Log in and get the agent (which holds the JWT cookie)
        const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

        // 2. Try to update club 2 (Manchester United) to Arsenal (which already exists as club 1)
        const res = await agent
            .post('/clubs/2/update')
            .send({ 
                name: 'Arsenal', 
                country: 'Spain', 
                stadium: 'Estadio Test' 
            });
        expect(res.status).toBe(400);
    });
  });

  describe('POST /clubs/:clubId/delete', () => {
    // test the delete routes

    it('should fail as no auth', async () => {
        // Raw request without a logged-in agent should fail
        const res = await request(app)
            .post('/clubs/1/delete')
            .send({ name: 'FC Test', country: 'England', stadium: 'Test Arena' });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/login');
    });

    it('should work now as we include auth via the agent', async () => {
        // 1. Log in and get the agent (which holds the JWT cookie)
        const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

        // 2. Use the agent to make the request instead of 'request(app)'
        const res = await agent
            .post('/clubs/1/delete')
            .send({ 
                name: 'New Test Club', 
                country: 'Spain', 
                stadium: 'Estadio Test' 
            });
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/clubs');
    });
})
});