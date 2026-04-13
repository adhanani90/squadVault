const db = require("../db/queries");
const { validationResult } = require('express-validator');

async function getClubsList(req, res) {
    const clubs = await db.getAllClubs();
    res.json(clubs);
}

async function getClub(req, res) {
    const { clubId } = req.params;
    const [club, players] = await Promise.all([
        db.getClub(clubId),
        db.getPlayersAtClub(clubId)
    ]);

    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }

    res.json({ club, players });
}

async function createClub(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, stadium, country } = req.body;

    const existingClub = await db.getClubByName(name);
    if (existingClub) {
        return res.status(400).json({ errors: [{ msg: 'Club name already exists' }] });
    }

    await db.insertClub({ name, stadium, country });
    res.status(201).json({ message: 'Club created' });
}

async function updateClub(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { clubId } = req.params;
    const club = await db.getClub(clubId);
    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }

    const { name, stadium, country } = req.body;

    if (name.toLowerCase() !== club.name.toLowerCase()) {
        const existingClub = await db.getClubByName(name);
        if (existingClub) {
            return res.status(400).json({ errors: [{ msg: 'Club name already exists' }] });
        }
    }

    await db.updateClub(clubId, { name, stadium, country });
    res.json({ message: 'Club updated' });
}

async function deleteClub(req, res) {
    await db.deleteClub(req.params.clubId);
    res.json({ message: 'Club deleted' });
}

async function searchClubs(req, res) {
    const { searchedName, country } = req.query;
    const clubs = await db.searchClubs(searchedName, country);
    res.json(clubs);
}

module.exports = { getClubsList, getClub, createClub, updateClub, deleteClub, searchClubs };
