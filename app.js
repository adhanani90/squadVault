const express = require('express');
const app = express();
const cors = require('cors');
const path = require("node:path");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const indexRouter = require('./routes/indexRouter');
const playerRouter = require('./routes/playerRouter');
const authRouter = require('./routes/authRoute');

// CORS — allow the React frontend to send cookies cross-origin
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Decode JWT on every request and expose user to downstream middleware
app.use((req, res, next) => {
  const token = req.cookies?.jwt;
  res.locals.user = null;
  if (token) {
    try {
      res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // invalid/expired token — leave user as null
    }
  }
  next();
});

app.use('/auth', authRouter);
app.use('/clubs', indexRouter);    // All routes in indexRouter now start with /clubs
app.use('/players', playerRouter);

// Catch-all: serve React app for any non-API route (supports client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Running on ${PORT}`));
}


app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ error: "Something went wrong on our end!" });
});

module.exports = app;