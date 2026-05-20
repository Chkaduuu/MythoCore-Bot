const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[MythosCore] Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: '/help | MythosCore', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
