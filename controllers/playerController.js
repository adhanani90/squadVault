const db = require("../db/queries");
const { validationResult } = require('express-validator');

async function getPlayersList(req, res) {
    const players = await db.getAllPlayers();
    res.json(players);
}

async function getPlayer(req, res) {
    const { playerId } = req.params;
    const [player, transfers] = await Promise.all([
        db.getPlayer(playerId),
        db.getTransfersForPlayer(playerId)
    ]);
    if (!player) {
        return res.status(404).json({ error: "Player not found" });
    }
    res.json({ player, transfers });
}

async function getPlayerTransfers(req, res) {
    const { playerId } = req.params;
    const player = await db.getPlayer(playerId);
    if (!player) {
        return res.status(404).json({ error: "Player not found" });
    }
    const transfers = await db.getTransfersForPlayer(playerId);
    res.json({ playerId: player.id, player: `${player.first_name} ${player.last_name}`, transfers });
}

async function searchPlayers(req, res) {
    const { searchedName, nationality } = req.query;
    const players = await db.searchPlayers(searchedName, nationality);
    res.json(players);
}

async function createPlayer(req, res) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }

    const { firstName, lastName, clubId, position, nationality, dateOfBirth } = req.body;

    const club = await db.getClub(clubId);
    if (!club) {
        return res.status(400).json({ errors: [{ msg: 'Club does not exist' }] });
    }

    await db.insertPlayer({ firstName, lastName, clubId, position, nationality, dateOfBirth });
    res.status(201).json({ message: 'Player created' });
}

async function updatePlayer(req, res) {
    const { playerId } = req.params;
    const { firstName, lastName, clubId, position, nationality, dateOfBirth } = req.body;

    const player = await db.getPlayer(playerId);
    if (!player) {
        return res.status(404).json({ error: "Player not found" });
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }

    const club = await db.getClub(clubId);
    if (!club) {
        return res.status(400).json({ errors: [{ msg: 'Club does not exist' }] });
    }

    const existingPlayer = await db.getPlayerIdByName(firstName, lastName);
    if (existingPlayer && existingPlayer !== parseInt(playerId)) {
        return res.status(400).json({ errors: [{ msg: 'Player name already taken' }] });
    }

    await db.updatePlayer(playerId, { firstName, lastName, clubId, position, nationality, dateOfBirth });
    res.json({ message: 'Player updated' });
}

async function transferPlayer(req, res) {
    const { playerId } = req.params;
    const { toClubId, fromClubId: fromClubIdBody, amount, date } = req.body;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }

    const player = await db.getPlayer(playerId);
    if (!player) {
        return res.status(404).json({ error: "Player not found" });
    }

    // fromClubId defaults to the player's current club if not supplied
    const fromClubId = fromClubIdBody ? parseInt(fromClubIdBody) : player.club_id;

    if (fromClubId === parseInt(toClubId)) {
        return res.status(400).json({ error: "Source and destination club cannot be the same" });
    }

    // Validate source club exists when explicitly provided
    if (fromClubIdBody) {
        const sourceClub = await db.getClub(fromClubId);
        if (!sourceClub) {
            return res.status(400).json({ error: "Source club does not exist" });
        }
    }

    const destinationClub = await db.getClub(toClubId);
    if (!destinationClub) {
        return res.status(400).json({ error: "Destination club does not exist" });
    }

    // Only update the player's current club if they aren't already there
    // (historical entries where toClubId === player.club_id just log the record)
    await db.executeTransfer({
        playerId,
        fromClubId,
        toClubId,
        amount,
        transferredAt: date ?? null,
        updateCurrentClub: parseInt(toClubId) !== player.club_id,
    });
    res.json({ message: 'Transfer completed' });
}

async function deletePlayer(req, res) {
    const { playerId } = req.params;
    await db.deletePlayer(playerId);
    res.json({ message: 'Player deleted' });
}

module.exports = {
    getPlayersList,
    getPlayer,
    getPlayerTransfers,
    createPlayer,
    updatePlayer,
    transferPlayer,
    deletePlayer,
    searchPlayers
};
