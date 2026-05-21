const db = require('../../database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    try {
      const config = db.get().get('SELECT * FROM welcomer_config WHERE guild_id = ?', [member.guild.id]);
      if (!config?.leave_channel) return;
      const channel = member.guild.channels.cache.get(config.leave_channel);
      if (!channel) return;
      const message = (config.leave_message || '**{username}** has left the server. We now have **{count}** members.')
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{count}/g, member.guild.memberCount);
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    } catch {}
  },
};
