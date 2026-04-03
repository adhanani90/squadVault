const express = require('express');
const app = express();
const path = require("node:path");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
require('dotenv').config(); // to use .env

const indexRouter = require('./routes/indexRouter');
const playerRouter = require('./routes/playerRouter')
const authRouter = require('./routes/authRoute');


const assetsPath = path.join(__dirname, "public") // find css files under public directory
app.use(express.static(assetsPath));
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use(express.urlencoded({extended:true})); // to parse the HTML params
app.use(express.json());
app.use(cookieParser());



app.use(async (req, res, next) => {
  // setting the user if it is already logged in
  const token = req.cookies?.jwt;
  res.locals.user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;
      console.log("User Decoded:", res.locals.user); 
    } catch (err) {
      // just remain as null
    }
  }

  // If db.getNavLinks() fails, Express 5 catches it and calls next(err) for you
  const links = [{name: "Home", href:"/"}, {name:"Clubs", href:"/"}];
  const bottomLinks = [{name: "Privacy", href:"/"}, {name:"About", href:"/"}];

  res.locals.links = links;
  res.locals.bottomLinks = bottomLinks;

  next(); 
});

app.use('/auth', authRouter);
app.use('/clubs', indexRouter);    // All routes in indexRouter now start with /clubs
app.use('/players', playerRouter);
app.get('/', (req, res) => res.redirect('/clubs'));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Running on ${PORT}`));
}


app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).send("Something went wrong on our end!");
});

module.exports = app;