const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands for MythosCore.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 MythosCore — Command List')
      .setColor('#5865F2')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription('Here are all available commands:')
      .addFields(
        {
          name: '⚙️ General',
          value: '`/help` — Show this menu\n`/ping` — Check bot latency',
          inline: false,
        },
        {
          name: '📢 Embed',
          value: '`/embed` — Create a custom embed message',
          inline: false,
        },
        {
          name: '🎫 Tickets',
          value: '`/ticket setup` — Set up the ticket panel in a channel',
          inline: false,
        },
        {
          name: '🎉 Giveaways',
          value: '`/giveaway start` — Start a giveaway\n`/giveaway end` — End a giveaway early\n`/giveaway reroll` — Reroll giveaway winners',
          inline: false,
        },
        {
          name: '🔗 Dashboard',
          value: `[Open Dashboard](${process.env.DASHBOARD_URL || 'https://your-dashboard.up.railway.app'})`,
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({ text: 'MythosCore • Powered by discord.js' });

    await interaction.reply({ embeds: [embed] });
  },
};
