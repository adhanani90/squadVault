// players.test.js

jest.setTimeout(30000); // populateDB reseeds are slow under load

const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const testHelper = require('./testHelper');
const populateDB = require('../db/populateDB');
const db = require('../db/queries');

describe('Players Routes', () => {
  const seededUser = {
    email: 'new@gmail.com',
    password: 'password123'
  };

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /players', () => {
    it('should return a JSON array of players', async () => {
      const res = await request(app).get('/players');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some(p => p.first_name === 'Bukayo')).toBe(true);
      expect(res.body.some(p => p.last_name === 'Saka')).toBe(true);
    });

    it('should return player details with transfer history', async () => {
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await request(app).get(`/players/${sakaId}`);
      expect(res.status).toBe(200);
      expect(res.body.player.first_name).toBe('Bukayo');
      expect(res.body.player.last_name).toBe('Saka');
      expect(Array.isArray(res.body.transfers)).toBe(true);
    });

    it('should return 404 for a nonexistent player', async () => {
      const res = await request(app).get('/players/9999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Player not found');
    });
  });

  describe('POST /players', () => {
    afterEach(async () => {
      await populateDB();
    });

    it('should return 401 with no auth', async () => {
      const res = await request(app)
        .post('/players')
        .send({ firstName: 'FC', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(401);
    });

    it('should create a player and return 201 when authenticated', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/players')
        .send({ firstName: 'New', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Player created');
    });

    it('should return 400 when club does not exist', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/players')
        .send({ firstName: 'New', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 9999, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /players/:playerId/update', () => {
    afterEach(async () => {
      await populateDB();
    });

    it('should return 401 with no auth', async () => {
      const res = await request(app)
        .post('/players/1/update')
        .send({ firstName: 'Bukayo', lastName: 'Saka', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(401);
    });

    it('should update a player and return 200 when authenticated', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await agent
        .post(`/players/${sakaId}/update`)
        .send({ firstName: 'Bukayo', lastName: 'Saka', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Player updated');
    });

    it('should return 404 when player does not exist', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent
        .post('/players/9999/update')
        .send({ firstName: 'John', lastName: 'Doe', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(404);
    });

    it('should return 400 when club does not exist', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await agent
        .post(`/players/${sakaId}/update`)
        .send({ firstName: 'Bukayo', lastName: 'Saka', position: 'Attacker', nationality: 'England', clubId: 9999, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when name is already taken by another player', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      // Try to rename Saka to "Martin Odegaard" (already exists)
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await agent
        .post(`/players/${sakaId}/update`)
        .send({ firstName: 'Martin', lastName: 'Odegaard', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /players/:playerId/transfers', () => {
    it('should return transfer history as JSON', async () => {
      const palmerId = await db.getPlayerIdByName('Cole', 'Palmer');
      const res = await request(app).get(`/players/${palmerId}/transfers`);
      expect(res.status).toBe(200);
      expect(res.body.transfers).toHaveLength(1);
      expect(res.body.transfers[0].from_club_name).toBe('Manchester City');
      expect(res.body.transfers[0].to_club_name).toBe('Chelsea');
      expect(parseFloat(res.body.transfers[0].amount)).toBe(47000000);
    });

    it('should return 404 for a nonexistent player', async () => {
      const res = await request(app).get('/players/9999/transfers');
      expect(res.status).toBe(404);
    });

    it('should return empty array for player with no transfer history', async () => {
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await request(app).get(`/players/${sakaId}/transfers`);
      expect(res.status).toBe(200);
      expect(res.body.transfers).toHaveLength(0);
    });
  });

  describe('POST /players/:playerId/transfer', () => {
    afterEach(async () => {
      await populateDB();
    });

    it('should return 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/players/1/transfer')
        .send({ toClubId: 2, amount: 0 });
      expect(res.status).toBe(401);
    });

    it('should successfully transfer a player and return 200', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const manUtdId = (await db.getClubByName('Manchester United')).id;

      const res = await testHelper.transferPlayerApi(agent, sakaId, manUtdId, 50000000);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Transfer completed');

      const updated = await db.getPlayer(sakaId);
      expect(updated.club_id).toBe(manUtdId);
    });

    it('should record a transfer history entry after a successful transfer', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const manUtdId = (await db.getClubByName('Manchester United')).id;

      await testHelper.transferPlayerApi(agent, sakaId, manUtdId, 50000000);

      const transfers = await db.getTransfersForPlayer(sakaId);
      expect(transfers).toHaveLength(1);
      expect(transfers[0].to_club_name).toBe('Manchester United');
      expect(parseFloat(transfers[0].amount)).toBe(50000000);
    });

    it('should return 400 when toClubId is missing', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent.post('/players/1/transfer').send({ amount: 0 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when amount is missing', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent.post('/players/1/transfer').send({ toClubId: 2 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when transferring to the same club', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const saka = await db.getPlayer(sakaId);
      const res = await testHelper.transferPlayerApi(agent, sakaId, saka.club_id, 0);
      expect(res.status).toBe(400);
    });

    it('should return 400 when destination club does not exist', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await testHelper.transferPlayerApi(agent, sakaId, 9999, 0);
      expect(res.status).toBe(400);
    });

    it('should return 404 when player does not exist', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await testHelper.transferPlayerApi(agent, 9999, 2, 0);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /players/:playerId/delete', () => {
    afterEach(async () => {
      await populateDB();
    });

    it('should return 401 with no auth', async () => {
      const res = await request(app).post('/players/1/delete');
      expect(res.status).toBe(401);
    });

    it('should delete a player and return 200 when authenticated', async () => {
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const sakaId = await db.getPlayerIdByName('Bukayo', 'Saka');
      const res = await agent.post(`/players/${sakaId}/delete`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Player deleted');
      expect(await db.getPlayer(sakaId)).toBeNull();
    });
  });
});
