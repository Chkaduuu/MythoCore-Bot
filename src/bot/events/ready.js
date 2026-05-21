const { ActivityType } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`✅ Logged in as ${client.user.tag}`);
    logger.info(`📊 Serving ${client.guilds.cache.size} guilds`);

    const statuses = [
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: '/help for commands', type: ActivityType.Playing },
      { name: 'your commands', type: ActivityType.Listening },
    ];
    let i = 0;
    client.user.setActivity(statuses[0].name, { type: statuses[0].type });
    setInterval(() => {
      i = (i + 1) % statuses.length;
      client.user.setActivity(statuses[i].name, { type: statuses[i].type });
    }, 30000);
  },
};
