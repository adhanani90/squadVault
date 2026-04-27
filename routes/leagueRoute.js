const { Router } = require("express");
const leagueRouter = Router();
const leagueController = require("../controllers/leagueController");

leagueRouter.get("/standings", leagueController.getStandings);

leagueRouter.post("/sync", leagueController.syncStandings);

module.exports = leagueRouter;