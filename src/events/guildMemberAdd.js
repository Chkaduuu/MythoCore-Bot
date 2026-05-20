const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const settings = db.getGuildSettings(member.guild.id);
    if (!settings.welcome_channel) return;

    const channel = member.guild.channels.cache.get(settings.welcome_channel);
    if (!channel) return;

    const message = (settings.welcome_message || 'Welcome {user} to {server}!')
      .replace('{user}', member.toString())
      .replace('{server}', member.guild.name)
      .replace('{memberCount}', member.guild.memberCount);

    const embed = new EmbedBuilder()
      .setTitle('👋 Welcome!')
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor('#57F287')
      .setTimestamp()
      .setFooter({ text: `Member #${member.guild.memberCount} • MythosCore` });

    await channel.send({ embeds: [embed] }).catch(() => {});
  },
};
