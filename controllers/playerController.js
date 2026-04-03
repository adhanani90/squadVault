const e = require("express");
const db = require("../db/queries");
const {body, validationResult} = require('express-validator');

async function getPlayersList(req, res) {
    const playersList = await db.getAllPlayers(); 
    res.render("playerList", { players: playersList });
}

async function getPlayer(req, res) {
    const { playerId } = req.params;
    const player = await db.getPlayer(playerId);
    res.render("playerDetail", { player: player });
}

// PAGE: Show the form to add a player
async function getCreatePlayerForm(req, res) {
    // You might need a list of clubs so the user can choose which club the player joins
    const clubs = await db.getAllClubs();
    res.render("createPlayerForm", { clubs: clubs });
}

// API ACTION: Process the new player
async function createPlayer(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }
    const { firstName, lastName, clubId, position, nationality, dateOfBirth } = req.body;
    
    // Validate that the club exists
    const club = await db.getClub(clubId);
    if (!club) {
        return res.status(400).send({ error: 'Club does not exist' });
    }
    
    await db.insertPlayer({ firstName, lastName, clubId, position, nationality, dateOfBirth });
    
    res.redirect("/players");
}

async function updatePlayer(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }
    const {playerId} = req.params;
    const { firstName, lastName, clubId, position, nationality, dateOfBirth } = req.body;
    
    // Check if the player exists
    const player = await db.getPlayer(playerId);
    if (!player) {
        return res.status(404).send({ error: 'Player not found' });
    }
    
    // Validate that the club exists
    const club = await db.getClub(clubId);
    if (!club) {
        return res.status(400).send({ error: 'Club does not exist' });
    }
    
    // Check if another player already has this name
    const existingPlayer = await db.getPlayerIdByName(firstName, lastName);
    if (existingPlayer && existingPlayer !== parseInt(playerId)) {
        return res.status(400).send({ error: 'Player name already taken' });
    }
    
    await db.updatePlayer(playerId, {
        firstName, lastName, clubId, position, nationality, dateOfBirth
    });
    res.redirect(`/players/${playerId}`);
}

async function deletePlayer(req, res) {
    const {playerId} = req.params;
    await db.deletePlayer(playerId);
    res.redirect('/players');
}

module.exports = {
    getPlayersList,
    getPlayer,
    getCreatePlayerForm,
    createPlayer,
    updatePlayer,
    deletePlayer
};