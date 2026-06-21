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
const leagueRouter = require('./routes/leagueRoute')

// importing redis client for use in other files
const redisClient = require('./utils/redis');
const {createProxyMiddleware} = require('http-proxy-middleware');

// ✅ API & Proxy middleware FIRST (before static files)
app.use('/api/ml', createProxyMiddleware({
  target: process.env.ML_URL || 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/api/ml': '' },
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error('ML Proxy Error:', err);
    res.status(503).json({ error: 'ML service unavailable', details: err.message });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[ML Proxy] ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
  }
}))

// Static files after API routes
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
app.use('/league', leagueRouter)

app.get('/', (req, res) => res.redirect('/clubs'));


// Catch-all: serve React app for any non-API route (supports client-side routing)
// Catch-all: serve React SPA for client-side routes when built
app.use((req, res, next) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(distIndex, (err) => {
    if (err) next(); // dist not built yet — fall through gracefully
  });
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