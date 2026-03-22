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
    const { firstName, lastName, clubId, position, nationality } = req.body;
    await db.insertPlayer({ firstName, lastName, clubId, position, nationality });
    
    res.redirect("/players");
}

async function updatePlayer(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }
    const {playerId} = req.params;
    const { firstName, lastName, clubId, position, nationality, dateOfBirth } = req.body;
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