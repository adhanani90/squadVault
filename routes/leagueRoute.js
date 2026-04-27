const { Router } = require("express");
const leagueRouter = Router();
const leagueController = require("../controllers/leagueController");
const authMiddleware = require("../middleware/authMiddleware");

leagueRouter.get("/standings", leagueController.getStandings);

leagueRouter.post("/sync", authMiddleware,leagueController.syncStandings);

module.exports = leagueRouter;