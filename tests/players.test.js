// players.test.js

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
    // Keep this to ensure the file-specific connection closes
    await pool.end();
  });

  describe('GET /players', () => {
    it('should render the main title, players list, and "Add New Player" link', async () => {
      const res = await request(app).get('/players');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Players');
      expect(res.text).toContain('Add a New Player');

      expect(res.text).toContain('Bukayo'); // First player name
      expect(res.text).toContain('Saka'); // Last player name
      expect(res.text).toContain('Attacker'); // Position

    })

    it('should render the new player form', async () => {
      const seededUser = { email: 'new@gmail.com', password: 'password123' };
      const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
      const res = await agent.get('/players/new');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Add a New Player');
      expect(res.text).toContain('First Name');
      expect(res.text).toContain('Last Name');
      expect(res.text).toContain('Position');
      expect(res.text).toContain('Nationality');
      expect(res.text).toContain('Register Player');
    });

    it('should render the player details page', async () => {
      const res = await request(app).get('/players/1');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Bukayo Saka');
      expect(res.text).toContain('Attacker');
    });
    })

    describe('POST /players', () => {
        const seededUser = { email: 'new@gmail.com', password: 'password123' };

        it('should fail as no auth', async () => {
            // Raw request without a logged-in agent should fail
            const res = await request(app)
                .post('/players')
                .send({ firstName: 'FC', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/auth/login');
        });

        it('should work now as we include auth via the agent', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

            // 2. Use the agent to make the request instead of 'request(app)'
            const res = await agent
                .post('/players')
                .send({ 
                    firstName: 'New', 
                    lastName: 'Test', 
                    position: 'Attacker', 
                    nationality: 'England', 
                    clubId: 1,
                    dateOfBirth: '2001-09-05'
                });
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/players');
        });

        it('should fail if the club does not exist', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

            // 2. Use the agent to make the request instead of 'request(app)'
            const res = await agent
                .post('/players')
                .send({ 
                    firstName: 'New', 
                    lastName: 'Test', 
                    position: 'Attacker', 
                    nationality: 'England', 
                    clubId: 100,
                    dateOfBirth: '2001-09-05'
                });
            expect(res.status).toBe(400);
        });

        it('should fail if name is already taken', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

            // 2. Posting a player with the same name as an existing player should fail
            const res = await agent
                .post('/players')
                .send({ 
                    firstName: 'New', 
                    lastName: 'Test', 
                    position: 'Attacker', 
                    nationality: 'England', 
                    clubId: 2,
                    dateOfBirth: '2001-09-05'
                });
        })
    })

    describe('POST /players/:playerId/update', () => {
        // test the update routes

        it('should fail as no auth', async () => {
            // Raw request without a logged-in agent should fail
            const res = await request(app)
                .post('/players/1/update')
                .send({ firstName: 'FC', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/auth/login');
        });

        it('should work now as we include auth via the agent', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

            // 2. Use the agent to make the request instead of 'request(app)'
            const res = await agent
                .post('/players/1/update')
                .send({ 
                    firstName: 'Bukayo', 
                    lastName: 'Saka', 
                    position: 'Attacker', 
                    nationality: 'England', 
                    clubId: 1,
                    dateOfBirth: '2001-09-05'
                });
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/players/1');
        });

        it('should fail if the club does not exist', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);

            // 2. Use the agent to make the request instead of 'request(app)'
            const res = await agent
                .post('/players/100/update')
                .send({ 
                    firstName: 'Nonexistent', 
                    lastName: 'Player', 
                    position: 'Attacker', 
                    nationality: 'England', 
                    clubId: 1,
                    dateOfBirth: '2001-09-05'
                });
            expect(res.status).toBe(404);
        });

        it('should fail if name is already taken', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);
            const playerId = await db.getPlayerIdByName('New', 'Test'); // our new player   

            // 2. Posting a player with the same name as an existing player should fail

            const res = await agent.post(`/players/${playerId}/update`).send({
                firstName: 'Bukayo',
                lastName: 'Saka',
                position: 'Attacker',
                nationality: 'England',
                clubId: 1,
                dateOfBirth: '2001-09-05'
            })
            expect(res.status).toBe(400);
        })

    })

    describe('POST /players/:playerId/delete', () => {
        // test the delete routes        
        it('should fail as no auth', async () => {
            // Raw request without a logged-in agent should fail
            const res = await request(app)
                .post('/players/1/delete')
                .send({ firstName: 'FC', lastName: 'Test', position: 'Attacker', nationality: 'England', clubId: 1, dateOfBirth: '2001-09-05' });
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/auth/login');
        }); 

        it('should work now as we include auth via the agent', async () => {
            // 1. Log in and get the agent (which holds the JWT cookie)
            const { agent } = await testHelper.loginUser(seededUser.email, seededUser.password);            
            const playerId = await db.getPlayerIdByName('New', 'Test'); // our new player

            // delete our new player using the agent, providing the playerId
            const res = await agent.post(`/players/${playerId}/delete`)
            expect(res.status).toBe(302);
            expect(res.header.location).toBe('/players');

            expect(await db.getPlayer(playerId)).toBe(null);
        });
    })


});
