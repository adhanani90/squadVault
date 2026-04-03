const { Router } = require("express");
const playerRouter = Router();
const playerController = require("../controllers/playerController.js");
const {body, validationResult} = require('express-validator');
const authMiddleware = require("../middleware/authMiddleware");

const playerValidationRules = [
    body('firstName').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('First name must be 2-255 characters'),
    body('lastName').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Last name must be 2-255 characters'),
    body('position').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Position must be 2-255 characters'),
    body('nationality').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Nationality must be 2-255 characters'),
    // clubId is an int
    body('clubId').trim().notEmpty().isInt({ min: 1, max: 255 }).withMessage('Club ID must be a positive integer')
];


playerRouter.get("/", playerController.getPlayersList);

// GET /players/new - The PAGE to see the "Add Player" form
playerRouter.get("/new", authMiddleware ,playerController.getCreatePlayerForm);

// GET /players/:playerId - The PAGE for a specific player
playerRouter.get("/:playerId", playerController.getPlayer);

// POST /players - The API ACTION to save the player
playerRouter.post("/", authMiddleware, playerValidationRules, playerController.createPlayer);

// UPDATE /players/:playerId - The API ACTION to process the update form submission
playerRouter.post("/:playerId/update", authMiddleware, playerValidationRules, playerController.updatePlayer);

// DELETE /players/:playerId - The API ACTION to process the delete form submission
playerRouter.post("/:playerId/delete", authMiddleware,playerController.deletePlayer);


module.exports = playerRouter;