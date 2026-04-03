const db = require("../db/queries");
const {body, validationResult} = require('express-validator');

async function getClubsList(req, res) {
    const clubsList = await db.getAllClubs(); 
    res.render("index", { clubs: clubsList });
}

async function getClub(req, res) {
    const { clubId } = req.params;
    const [club, playersAtClub] = await Promise.all([
        db.getClub(clubId),
        db.getPlayersAtClub(clubId)
    ]);

    if (!club) {
        return res.status(404).render("404", { message: "Club not found" });
    }

    res.render("clubDetail", { club: club, playersAtClub: playersAtClub });
}

// 1. PAGE: Show the form to the user
async function getCreateClubForm(req, res) {
    res.render("createClubForm"); // Renders createClubForm.ejs
}

// 2. API ACTION: Receive form data and save to DB 
async function createClub(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('createClubForm', { 
            errors: errors.array(),
            formData: req.body 
        });
    }
    const { name, stadium, country } = req.body;

    // Check if name is taken by a different club
    const existingClub = await db.getClubByName(name);
    if (existingClub) {
        return res.status(400).render('createClubForm', { 
            errors: [{ msg: 'Club name already exists' }],
            formData: req.body
        });
    }

    await db.insertClub({ name, stadium, country });
    res.redirect('/clubs');
}


async function updateClub(req, res) {
    // need to check if the club exists first

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('createClubForm', { 
            errors: errors.array(),
            formData: req.body 
        });
    }
    const {clubId} = req.params;
    const club = await db.getClub(clubId);
    
    // Return 404 if club doesn't exist
    if (!club) {
        return res.status(404).render("404", { message: "Club not found" });
    }
    const { name, stadium, country } = req.body;

    // check if the new name is taken by another club
    if (name.toLowerCase() !== club.name.toLowerCase()) {
        const existingClub = await db.getClubByName(name);
        if (existingClub) {
            return res.status(400).render('createClubForm', { 
                errors: [{ msg: 'Club name already exists' }],
                formData: req.body
            });
        }
    }
    await db.updateClub(clubId, { name, stadium, country });    
    res.redirect(`/clubs/${clubId}`);
}

async function deleteClub(req, res) {
    await db.deleteClub(req.params.clubId);
    res.redirect("/clubs");
}

module.exports = {
    getClubsList,
    getClub,
    getCreateClubForm,
    createClub,
    updateClub,
    deleteClub
};