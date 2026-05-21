const express = require('express');
const router = express.Router();
const axios = require('axios');

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/auth/login');
  next();
}

router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const guilds = req.user.guilds?.filter(g => (BigInt(g.permissions) & 0x20n) === 0x20n) || [];
    res.render('dashboard', { user: req.user, guilds });
  } catch (e) {
    res.render('dashboard', { user: req.user, guilds: [] });
  }
});

router.get('/dashboard/:id', requireAuth, (req, res) => {
  res.render('guild', { user: req.user, guildId: req.params.id });
});

router.get('/dashboard/:id/moderation', requireAuth, (req, res) => {
  res.render('moderation', { user: req.user, guildId: req.params.id });
});

router.get('/dashboard/:id/economy', requireAuth, (req, res) => {
  res.render('economy', { user: req.user, guildId: req.params.id });
});

router.get('/dashboard/:id/leveling', requireAuth, (req, res) => {
  res.render('leveling', { user: req.user, guildId: req.params.id });
});

router.get('/dashboard/:id/automod', requireAuth, (req, res) => {
  res.render('automod', { user: req.user, guildId: req.params.id });
});

router.get('/dashboard/:id/welcomer', requireAuth, (req, res) => {
  res.render('welcomer', { user: req.user, guildId: req.params.id });
});

router.get('/dashboard/:id/giveaways', requireAuth, (req, res) => {
  res.render('giveaways', { user: req.user, guildId: req.params.id });
});

module.exports = router;
