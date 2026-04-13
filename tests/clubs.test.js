// tests/clubs.test.js

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

  afterEach(async () => {
    await populateDB();
  });

  describe('GET /clubs', () => {
    it('should return a JSON array of clubs', async () => {
      const res = await request(app).get('/clubs');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some(c => c.name === 'Arsenal')).toBe(true);
      expect(res.body.some(c => c.stadium === 'Emirates Stadium')).toBe(true);
      expect(res.body.some(c => c.name === 'Chelsea')).toBe(true);
    });
  });

  describe('GET /clubs/:clubId', () => {
    it('should return club details and its players as JSON', async () => {
      const res = await request(app).get('/clubs/1');
      expect(res.status).toBe(200);
      expect(res.body.club.name).toBe('Arsenal');
      expect(res.body.players.some(p => p.first_name === 'Bukayo')).toBe(true);
      expect(res.body.players.some(p => p.first_name === 'Martin')).toBe(true);
    });

    it('should return 404 for a nonexistent club', async () => {
      const res = await request(app).get('/clubs/9999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Club not found');
    });
  });

  describe('POST /clubs', () => {
    it('should return 401 with no auth', async () => {
      const res = await request(app)
        .post('/clubs')
        .send({ name: 'FC Test', country: 'England', stadium: 'Test Arena' });
      expect(res.status).toBe(401);
    });

    it('should create a club and return 201 when authenticated', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/clubs')
        .send({ name: 'New Test Club', country: 'Spain', stadium: 'Estadio Test' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Club created');
    });

    it('should return 400 when club name already exists', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/clubs')
        .send({ name: 'Arsenal', country: 'England', stadium: 'Emirates Stadium' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /clubs/:clubId/update', () => {
    it('should return 401 with no auth', async () => {
      const res = await request(app)
        .post('/clubs/1/update')
        .send({ name: 'FC Test', country: 'England', stadium: 'Test Arena' });
      expect(res.status).toBe(401);
    });

    it('should update a club and return 200 when authenticated', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/clubs/1/update')
        .send({ name: 'New Test Club', country: 'Spain', stadium: 'Estadio Test' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Club updated');
    });

    it('should return 404 when club does not exist', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/clubs/100/update')
        .send({ name: 'New Test Club', country: 'Spain', stadium: 'Estadio Test' });
      expect(res.status).toBe(404);
    });

    it('should return 400 when name is already taken', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/clubs/2/update')
        .send({ name: 'Arsenal', country: 'Spain', stadium: 'Estadio Test' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /clubs/:clubId/delete', () => {
    it('should return 401 with no auth', async () => {
      const res = await request(app)
        .post('/clubs/1/delete')
        .send();
      expect(res.status).toBe(401);
    });

    it('should delete a club and return 200 when authenticated', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent.post('/clubs/1/delete');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Club deleted');
    });
  });

  describe('GET /clubs/search', () => {
    it('should return clubs matching the search term and country', async () => {
      const res = await request(app).get('/clubs/search?searchedName=arsenal&country=england');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Arsenal');
    });

    it('should return clubs matching partial name with no country filter', async () => {
      const res = await request(app).get('/clubs/search?searchedName=ar&country=');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Arsenal');
    });

    it('should return 0 results when country does not match', async () => {
      const res = await request(app).get('/clubs/search?searchedName=arsenal&country=france');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('should return both Manchester clubs when searching for "ma"', async () => {
      const res = await request(app).get('/clubs/search?searchedName=ma&country=');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(c => c.name === 'Manchester United')).toBe(true);
      expect(res.body.some(c => c.name === 'Manchester City')).toBe(true);
    });

    it('should return 0 results when searching for "ce"', async () => {
      const res = await request(app).get('/clubs/search?searchedName=ce&country=');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });
});
