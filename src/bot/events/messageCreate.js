const db = require('../../database');
const { handleXP } = require('../utils/leveling');
const { checkAutoMod } = require('../utils/automod');
const { checkStickyMessages } = require('../utils/sticky');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Message tracking
    try {
      db.get().run(
        'INSERT INTO users (id, guild_id, messages) VALUES (?, ?, 1) ON CONFLICT(id, guild_id) DO UPDATE SET messages = messages + 1',
        [message.author.id, message.guild.id]
      );
    } catch {}

    // AutoMod
    try { await checkAutoMod(message, client); } catch {}

    // XP/Leveling
    try { await handleXP(message, client); } catch {}

    // Sticky Messages
    try { await checkStickyMessages(message, client); } catch {}
  },
};
