const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'mythoscore.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT DEFAULT '!',
    welcome_channel TEXT,
    welcome_message TEXT DEFAULT 'Welcome {user} to {server}!',
    leave_channel TEXT,
    leave_message TEXT DEFAULT '{user} has left {server}.',
    ticket_category TEXT,
    ticket_log_channel TEXT,
    ticket_support_role TEXT,
    ticket_message TEXT DEFAULT 'Click the button below to open a ticket.',
    log_channel TEXT,
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at INTEGER DEFAULT (strftime('%s','now')),
    closed_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    host_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    winners INTEGER DEFAULT 1,
    ends_at INTEGER NOT NULL,
    ended INTEGER DEFAULT 0,
    participants TEXT DEFAULT '[]'
  );
`);

module.exports = {
  getGuildSettings(guildId) {
    let row = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
    if (!row) {
      db.prepare('INSERT OR IGNORE INTO guild_settings (guild_id) VALUES (?)').run(guildId);
      row = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
    }
    return row;
  },

  updateGuildSettings(guildId, data) {
    const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE guild_settings SET ${keys}, updated_at = strftime('%s','now') WHERE guild_id = ?`).run(...values, guildId);
  },

  createTicket(guildId, channelId, userId) {
    const result = db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id) VALUES (?, ?, ?)').run(guildId, channelId, userId);
    return result.lastInsertRowid;
  },

  closeTicket(channelId) {
    db.prepare('UPDATE tickets SET status = ?, closed_at = strftime(\'%s\',\'now\') WHERE channel_id = ?').run('closed', channelId);
  },

  getTicket(channelId) {
    return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
  },

  createGiveaway(data) {
    const result = db.prepare(
      'INSERT INTO giveaways (guild_id, channel_id, host_id, prize, winners, ends_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(data.guildId, data.channelId, data.hostId, data.prize, data.winners, data.endsAt);
    return result.lastInsertRowid;
  },

  updateGiveawayMessageId(id, messageId) {
    db.prepare('UPDATE giveaways SET message_id = ? WHERE id = ?').run(messageId, id);
  },

  getActiveGiveaways() {
    return db.prepare('SELECT * FROM giveaways WHERE ended = 0').all();
  },

  getGiveaway(messageId) {
    return db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
  },

  updateGiveawayParticipants(id, participants) {
    db.prepare('UPDATE giveaways SET participants = ? WHERE id = ?').run(JSON.stringify(participants), id);
  },

  endGiveaway(id) {
    db.prepare('UPDATE giveaways SET ended = 1 WHERE id = ?').run(id);
  },

  getAllGuildSettings() {
    return db.prepare('SELECT * FROM guild_settings').all();
  }
};
