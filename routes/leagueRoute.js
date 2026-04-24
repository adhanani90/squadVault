const { Router } = require("express");
const leagueRouter = Router();
const leagueController = require("../controllers/leagueController");

leagueRouter.get("/standings", leagueController.getStandings);

module.exports = leagueRouter;