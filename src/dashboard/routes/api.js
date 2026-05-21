const express = require('express');
const router = express.Router();
const db = require('../../database');

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Get guild config
router.get('/guild/:id', requireAuth, (req, res) => {
  const guild = db.get().get('SELECT * FROM guilds WHERE id = ?', [req.params.id]);
  const automod = db.get().get('SELECT * FROM automod_config WHERE guild_id = ?', [req.params.id]);
  const welcomer = db.get().get('SELECT * FROM welcomer_config WHERE guild_id = ?', [req.params.id]);
  const logs = db.get().get('SELECT * FROM logs_config WHERE guild_id = ?', [req.params.id]);
  res.json({ guild, automod, welcomer, logs });
});

// Update automod config
router.post('/guild/:id/automod', requireAuth, (req, res) => {
  const { anti_spam, anti_links, anti_invites, anti_caps, anti_mentions, action } = req.body;
  db.get().run('INSERT OR IGNORE INTO automod_config (guild_id) VALUES (?)', [req.params.id]);
  db.get().run(
    'UPDATE automod_config SET anti_spam=?, anti_links=?, anti_invites=?, anti_caps=?, anti_mentions=?, action=? WHERE guild_id=?',
    [anti_spam ? 1 : 0, anti_links ? 1 : 0, anti_invites ? 1 : 0, anti_caps ? 1 : 0, anti_mentions ? 1 : 0, action || 'warn', req.params.id]
  );
  res.json({ success: true });
});

// Get stats
router.get('/guild/:id/stats', requireAuth, (req, res) => {
  const memberCount = db.get().query('SELECT COUNT(*) as count FROM users WHERE guild_id = ?', [req.params.id]);
  const warnCount = db.get().query('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ?', [req.params.id]);
  const giveawayCount = db.get().query('SELECT COUNT(*) as count FROM giveaways WHERE guild_id = ? AND ended = 0', [req.params.id]);
  const topUsers = db.get().query('SELECT * FROM users WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT 5', [req.params.id]);
  res.json({
    members: memberCount[0]?.count || 0,
    warnings: warnCount[0]?.count || 0,
    activeGiveaways: giveawayCount[0]?.count || 0,
    topUsers,
  });
});

// Economy - get shop
router.get('/guild/:id/shop', requireAuth, (req, res) => {
  const items = db.get().query('SELECT * FROM economy_items WHERE guild_id = ?', [req.params.id]);
  res.json(items);
});

// Add shop item
router.post('/guild/:id/shop', requireAuth, (req, res) => {
  const { name, description, price, role_id } = req.body;
  db.get().run('INSERT INTO economy_items (guild_id, name, description, price, role_id) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, name, description, price, role_id]);
  res.json({ success: true });
});

// Giveaways
router.get('/guild/:id/giveaways', requireAuth, (req, res) => {
  const giveaways = db.get().query('SELECT * FROM giveaways WHERE guild_id = ? ORDER BY ends_at DESC LIMIT 20', [req.params.id]);
  res.json(giveaways);
});

// Moderation cases
router.get('/guild/:id/cases', requireAuth, (req, res) => {
  const cases = db.get().query('SELECT * FROM cases WHERE guild_id = ? ORDER BY created_at DESC LIMIT 50', [req.params.id]);
  res.json(cases);
});

module.exports = router;
