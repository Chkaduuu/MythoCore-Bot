require('dotenv').config();
const logger = require('../utils/logger');

let db;

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

async function init() {
  if (DB_TYPE === 'sqlite') {
    db = require('./providers/sqlite');
  } else if (DB_TYPE === 'mysql') {
    db = require('./providers/mysql');
  } else if (DB_TYPE === 'mongodb') {
    db = require('./providers/mongodb');
  } else {
    throw new Error(`Unknown DB_TYPE: ${DB_TYPE}`);
  }
  await db.init();
  logger.info(`Database provider: ${DB_TYPE}`);
}

function get() {
  if (!db) throw new Error('Database not initialized. Call init() first.');
  return db;
}

module.exports = { init, get };
