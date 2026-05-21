const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function init() {
  const dbPath = process.env.SQLITE_PATH || './data/database.sqlite';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createTables();
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guilds (
      id TEXT PRIMARY KEY,
      prefix TEXT DEFAULT '!',
      language TEXT DEFAULT 'en',
      settings TEXT DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      guild_id TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      balance INTEGER DEFAULT 0,
      bank INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      invites INTEGER DEFAULT 0,
      last_daily INTEGER DEFAULT 0,
      last_work INTEGER DEFAULT 0,
      UNIQUE(id, guild_id)
    );
    CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      moderator_id TEXT NOT NULL,
      reason TEXT,
      duration INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS giveaways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE,
      channel_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      host_id TEXT NOT NULL,
      prize TEXT NOT NULL,
      winners INTEGER DEFAULT 1,
      ends_at INTEGER NOT NULL,
      ended INTEGER DEFAULT 0,
      entries TEXT DEFAULT '[]',
      requirements TEXT DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS economy_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      role_id TEXT,
      type TEXT DEFAULT 'role'
    );
    CREATE TABLE IF NOT EXISTS user_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS reaction_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      role_id TEXT NOT NULL,
      type TEXT DEFAULT 'normal'
    );
    CREATE TABLE IF NOT EXISTS sticky_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      last_message_id TEXT
    );
    CREATE TABLE IF NOT EXISTS auto_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      type TEXT DEFAULT 'member'
    );
    CREATE TABLE IF NOT EXISTS level_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      required_level INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_id TEXT,
      author_id TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      questions TEXT NOT NULL,
      channel_id TEXT,
      log_channel_id TEXT,
      active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS application_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      answers TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS temp_voice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      channel_id TEXT UNIQUE NOT NULL,
      owner_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS temp_voice_settings (
      guild_id TEXT NOT NULL,
      category_id TEXT,
      create_channel_id TEXT,
      UNIQUE(guild_id)
    );
    CREATE TABLE IF NOT EXISTS logs_config (
      guild_id TEXT PRIMARY KEY,
      mod_log_channel TEXT,
      member_log_channel TEXT,
      message_log_channel TEXT,
      voice_log_channel TEXT,
      server_log_channel TEXT,
      invite_log_channel TEXT
    );
    CREATE TABLE IF NOT EXISTS automod_config (
      guild_id TEXT PRIMARY KEY,
      anti_spam INTEGER DEFAULT 0,
      anti_links INTEGER DEFAULT 0,
      anti_invites INTEGER DEFAULT 0,
      anti_caps INTEGER DEFAULT 0,
      anti_mentions INTEGER DEFAULT 0,
      max_mentions INTEGER DEFAULT 5,
      max_messages INTEGER DEFAULT 5,
      spam_interval INTEGER DEFAULT 5,
      whitelisted_channels TEXT DEFAULT '[]',
      whitelisted_roles TEXT DEFAULT '[]',
      banned_words TEXT DEFAULT '[]',
      action TEXT DEFAULT 'warn'
    );
    CREATE TABLE IF NOT EXISTS welcomer_config (
      guild_id TEXT PRIMARY KEY,
      welcome_channel TEXT,
      welcome_message TEXT,
      welcome_image INTEGER DEFAULT 0,
      welcome_image_bg TEXT,
      leave_channel TEXT,
      leave_message TEXT,
      dm_welcome INTEGER DEFAULT 0,
      dm_message TEXT
    );
    CREATE TABLE IF NOT EXISTS invite_tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      inviter_id TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      uses INTEGER DEFAULT 0,
      total_invited INTEGER DEFAULT 0,
      fake_invites INTEGER DEFAULT 0,
      left_invites INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS custom_rank_card (
      user_id TEXT PRIMARY KEY,
      bg_color TEXT DEFAULT '#2C2F33',
      text_color TEXT DEFAULT '#FFFFFF',
      bar_color TEXT DEFAULT '#5865F2',
      bg_image TEXT
    );
  `);
}

function query(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}

function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}

module.exports = { init, query, run, get, raw: () => db };
