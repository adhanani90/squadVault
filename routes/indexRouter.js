const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController.js");
const { body } = require('express-validator');
const authMiddleware = require("../middleware/authMiddleware");

const clubValidationRules = [
    body('name').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('stadium').trim().notEmpty().isLength({ max: 255 }),
    body('country').trim().notEmpty().isLength({ max: 255 })
];

indexRouter.get("/", indexController.getClubsList); 
indexRouter.get("/new", indexController.getCreateClubForm); 
indexRouter.get("/:clubId", indexController.getClub); 


indexRouter.post("/", 
    authMiddleware,           
    clubValidationRules,      
    indexController.createClub
);

// Update
indexRouter.post("/:clubId/update", 
    authMiddleware,           
    clubValidationRules,      
    indexController.updateClub
);

// Delete
indexRouter.post("/:clubId/delete", 
    authMiddleware,           
    indexController.deleteClub
);

module.exports = indexRouter;