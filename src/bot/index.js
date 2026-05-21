require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./handlers');
const db = require('../database');
const logger = require('../utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildInvites,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.giveaways = new Collection();
client.musicQueues = new Collection();

(async () => {
  try {
    await db.init();
    logger.info('✅ Database connected');

    await loadCommands(client);
    await loadEvents(client);

    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});

module.exports = client;
require('../dashboard/server');
