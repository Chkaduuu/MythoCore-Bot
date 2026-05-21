const mongoose = require('mongoose');

async function init() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/discordbot');
}

function query() { return null; }
function run() { return null; }
function get() { return null; }

module.exports = { init, query, run, get, mongoose };
