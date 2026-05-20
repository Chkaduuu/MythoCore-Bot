const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket system commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Send the ticket panel to a channel.')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Channel for the ticket panel').setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const settings = db.getGuildSettings(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setTitle('🎫 Support Tickets')
        .setDescription(
          settings.ticket_message ||
          'Need help? Click the button below to open a support ticket.\nOur team will assist you as soon as possible.'
        )
        .setColor('#5865F2')
        .setFooter({ text: 'MythosCore Tickets' })
        .setTimestamp();

      const btn = new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫');

      const row = new ActionRowBuilder().addComponents(btn);

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `✅ Ticket panel sent to ${channel}!`, ephemeral: true });
    }
  },
};
