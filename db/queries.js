const { get } = require("../app");
const pool = require("./pool");

// --- CLUB QUERIES ---

async function getAllClubs() {
    const { rows } = await pool.query("SELECT * FROM clubs ORDER BY name ASC");
    return rows;
}

async function getClub(id) {
    const { rows } = await pool.query("SELECT * FROM clubs WHERE id = $1", [id]);
    return rows[0];
}

async function insertClub({ name, stadium, country }) {
    await pool.query(
        "INSERT INTO clubs (name, stadium, country) VALUES ($1, $2, $3)",
        [name, stadium, country]
    );
}

// --- PLAYER QUERIES ---

async function getAllPlayers() {
    const { rows } = await pool.query("SELECT * FROM players ORDER BY last_name ASC");
    return rows;
}

async function getPlayer(id) {
    const { rows } = await pool.query("SELECT * FROM players WHERE id = $1", [id]);
    return rows[0] || null;
}

async function insertPlayer({ firstName, lastName, clubId, position, nationality, dateOfBirth }) {
    await pool.query(
        "INSERT INTO players (first_name, last_name, club_id, position, nationality, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6)",
        [firstName, lastName, clubId, position, nationality, dateOfBirth]
    );
}

async function getPlayersAtClub(clubId) {
    const { rows } = await pool.query("SELECT * FROM players WHERE club_id = $1", [clubId]);
    return rows;
}

async function updateClub(clubId, data) {
    await pool.query(
        "UPDATE clubs SET name = $1, stadium = $2, country = $3 WHERE id = $4",
        [data.name, data.stadium, data.country, clubId]
    );
    return clubId;
}   

async function deleteClub(clubId) {
    await pool.query("DELETE FROM clubs WHERE id = $1", [clubId]);
    return clubId;
}

async function updatePlayer(playerId, data) {
    await pool.query(
        "UPDATE players SET first_name = $1, last_name = $2, club_id = $3, position = $4, nationality = $5, date_of_birth = $6 WHERE id = $7",
        [data.firstName, data.lastName, data.clubId, data.position, data.nationality, data.dateOfBirth, playerId]
    );
    return playerId;
}

async function deletePlayer(playerId) {
    await pool.query("DELETE FROM players WHERE id = $1", [playerId]);
    return null;
}

async function getUserByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0];
}

async function insertUser(user) {
    // Destructure { rows } from the query result
    const { rows } = await pool.query(
        "INSERT INTO users (email, password, age, bio) VALUES ($1, $2, $3, $4) RETURNING id, email, age, bio", 
        [user.email, user.password, user.age, user.bio]
    );
    
    return rows[0];
}

async function deleteUser(userId) {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
}

async function getClubByName(name) {
    const { rows } = await pool.query(
        "SELECT * FROM clubs WHERE LOWER(name) = LOWER($1)", 
        [name]
    );
    return rows[0];
}

async function getPlayerIdByName(firstName, lastName) {
    const { rows } = await pool.query(
        "SELECT id FROM players WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2)", 
        [firstName, lastName]
    );
    return rows[0]?.id || null;
}

module.exports = {
    getAllClubs,
    getClub,
    insertClub,
    updateClub, 
    deleteClub, 
    getAllPlayers,
    getPlayer,
    insertPlayer,
    getPlayersAtClub,
    updatePlayer,
    deletePlayer,
    getUserByEmail,
    insertUser,
    deleteUser,
    getClubByName,
    getPlayerIdByName
};