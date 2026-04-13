const { Router } = require("express");
const playerRouter = Router();
const playerController = require("../controllers/playerController.js");
const { body } = require('express-validator');
const authMiddleware = require("../middleware/authMiddleware");

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

const playerValidationRules = [
    body('firstName').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('First name must be 2-255 characters'),
    body('lastName').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Last name must be 2-255 characters'),
    body('position').trim().notEmpty().isIn(POSITIONS).withMessage(`Position must be one of: ${POSITIONS.join(', ')}`),
    body('nationality').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Nationality must be 2-255 characters'),
    body('clubId').trim().notEmpty().isInt({ min: 1 }).withMessage('Club ID must be a positive integer')
];

const transferValidationRules = [
    body('toClubId').trim().notEmpty().isInt({ min: 1 }).withMessage('Destination club ID must be a positive integer'),
    body('fromClubId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Source club ID must be a positive integer'),
    body('amount').trim().notEmpty().isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),
    body('date').optional({ checkFalsy: true }).isISO8601().withMessage('Date must be a valid ISO 8601 date')
];


playerRouter.get("/", playerController.getPlayersList);
playerRouter.get("/search", playerController.searchPlayers);

// GET /players/:playerId - The PAGE for a specific player
playerRouter.get("/:playerId", playerController.getPlayer);

// POST /players - The API ACTION to save the player
playerRouter.post("/", authMiddleware, playerValidationRules, playerController.createPlayer);

// UPDATE /players/:playerId - The API ACTION to process the update form submission
playerRouter.post("/:playerId/update", authMiddleware, playerValidationRules, playerController.updatePlayer);

// DELETE /players/:playerId - The API ACTION to process the delete form submission
playerRouter.post("/:playerId/delete", authMiddleware, playerController.deletePlayer);

// GET /players/:playerId/transfers - Transfer history for a player (JSON)
playerRouter.get("/:playerId/transfers", playerController.getPlayerTransfers);

// POST /players/:playerId/transfer - Execute a transfer
playerRouter.post("/:playerId/transfer", authMiddleware, transferValidationRules, playerController.transferPlayer);


module.exports = playerRouter;
