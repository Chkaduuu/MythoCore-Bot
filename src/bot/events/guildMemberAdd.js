const db = require('../../database');
const { buildWelcomeEmbed, buildWelcomeImage } = require('../utils/welcomer');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const guild = member.guild;

    // Auto Roles
    try {
      const autoRoles = db.get().query(
        'SELECT role_id FROM auto_roles WHERE guild_id = ? AND type = ?',
        [guild.id, 'member']
      );
      for (const { role_id } of autoRoles) {
        const role = guild.roles.cache.get(role_id);
        if (role) await member.roles.add(role).catch(() => {});
      }
    } catch {}

    // Welcomer
    try {
      const config = db.get().get(
        'SELECT * FROM welcomer_config WHERE guild_id = ?',
        [guild.id]
      );
      if (!config || !config.welcome_channel) return;

      const channel = guild.channels.cache.get(config.welcome_channel);
      if (!channel) return;

      const message = (config.welcome_message || 'Welcome {user} to **{server}**!')
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, guild.name)
        .replace(/{count}/g, guild.memberCount);

      if (config.welcome_image) {
        const attachment = await buildWelcomeImage(member);
        await channel.send({ content: message, files: [attachment] });
      } else {
        const embed = buildWelcomeEmbed(member, message);
        await channel.send({ embeds: [embed] });
      }

      if (config.dm_welcome && config.dm_message) {
        const dm = (config.dm_message)
          .replace(/{user}/g, member.user.username)
          .replace(/{server}/g, guild.name);
        await member.send({ content: dm }).catch(() => {});
      }
    } catch {}

    // Invite Tracking
    try {
      const invites = await guild.invites.fetch();
      // Track invite usage logic here
    } catch {}
  },
};
