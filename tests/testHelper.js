// tests/testHelpers.js
const request = require('supertest');
const app = require('../app');
const db = require('../db/queries'); 


async function loginUser(email, password) {
  const agent = request.agent(app);
  const res = await agent
    .post('/auth/login')
    .send({ email, password });
  
  return { res, agent };
}

// Signup via API
async function signupUser(userData) {
  return request(app)
    .post('/auth/signup')
    .send(userData);
}

// Logout
async function logoutUser(agent) {
  return agent.get('/auth/logout');
}

/**
 * CRUD API HELPERS
 */

async function createClubApi(agent, clubData) {
  return agent.post('/clubs').send(clubData);
}

async function createPlayerApi(agent, playerData) {
  return agent.post('/players').send(playerData);
}

/**
 * DATABASE CLEANUP (Necessary to keep tests coherent)
 */
async function deleteTestUser(email) {
    const user = await db.getUserByEmail(email);
    if (user) {
        return db.deleteUser(user.id);
    }
}

/**
 * ASSERTION HELPERS
 */
function expectValidationError(res, expectedText) {
  // Check if response has HTML text (from render)
  if (res.text && typeof res.text === 'string') {
    expect(res.text).toContain(expectedText);
  } else {
    throw new Error(`Response missing text. Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
  }
}

module.exports = {
  loginUser,
  signupUser,
  logoutUser,
  createClubApi,
  createPlayerApi,
  deleteTestUser,
  expectValidationError
};