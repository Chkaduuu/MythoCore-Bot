require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const db = require('../database');
const logger = require('../utils/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.DASHBOARD_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// Passport Discord OAuth2
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.DASHBOARD_CALLBACK || 'http://localhost:3000/auth/callback',
  scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, { ...profile, accessToken }));
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/dashboard'));

// Socket.io for live updates
io.on('connection', (socket) => {
  socket.on('join-guild', (guildId) => socket.join(guildId));
});

const PORT = process.env.DASHBOARD_PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🌐 Dashboard running at http://localhost:${PORT}`);
});

module.exports = { app, io };
