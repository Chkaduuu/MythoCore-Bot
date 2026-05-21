const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
    await target.timeout(minutes * 60 * 1000, reason);
    const embed = new EmbedBuilder().setColor('#FF8C00').setTitle('⏱️ Member Timed Out')
      .addFields(
        { name: 'User', value: target.user.tag, inline: true },
        { name: 'Duration', value: `${minutes} minute(s)`, inline: true },
        { name: 'Reason', value: reason }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
