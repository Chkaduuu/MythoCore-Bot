const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s response time and API latency.'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Measuring ping...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor('#57F287')
      .addFields(
        { name: '📡 Roundtrip', value: `${roundtrip}ms`, inline: true },
        { name: '💓 Websocket', value: `${wsLatency}ms`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'MythosCore' });

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};
