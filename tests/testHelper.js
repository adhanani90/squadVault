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
  return agent.post('/auth/logout');
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

async function transferPlayerApi(agent, playerId, toClubId, amount) {
  return agent.post(`/players/${playerId}/transfer`).send({ toClubId, amount });
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
    const errors = res.body?.errors || [];
    const found = errors.some(e => e.msg && e.msg.includes(expectedText));
    if (!found) {
        throw new Error(`Expected error "${expectedText}" not found in: ${JSON.stringify(errors)}`);
    }
}

module.exports = {
  loginUser,
  signupUser,
  logoutUser,
  createClubApi,
  createPlayerApi,
  transferPlayerApi,
  deleteTestUser,
  expectValidationError
};