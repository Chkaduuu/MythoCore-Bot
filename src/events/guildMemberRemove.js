const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const settings = db.getGuildSettings(member.guild.id);
    if (!settings.leave_channel) return;

    const channel = member.guild.channels.cache.get(settings.leave_channel);
    if (!channel) return;

    const message = (settings.leave_message || '{user} has left {server}.')
      .replace('{user}', member.user.tag)
      .replace('{server}', member.guild.name)
      .replace('{memberCount}', member.guild.memberCount);

    const embed = new EmbedBuilder()
      .setTitle('👋 Goodbye!')
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor('#ED4245')
      .setTimestamp()
      .setFooter({ text: `MythosCore` });

    await channel.send({ embeds: [embed] }).catch(() => {});
  },
};
