const { EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild || message.author?.bot) return;
    try {
      const config = db.get().get('SELECT message_log_channel FROM logs_config WHERE guild_id = ?', [message.guild.id]);
      if (!config?.message_log_channel) return;
      const channel = message.guild.channels.cache.get(config.message_log_channel);
      if (!channel) return;
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🗑️ Message Deleted')
        .addFields(
          { name: 'Author', value: message.author ? `${message.author.tag} (${message.author.id})` : 'Unknown', inline: true },
          { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
          { name: 'Content', value: message.content?.slice(0, 1024) || '*No content*' }
        )
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    } catch {}
  },
};
