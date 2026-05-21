const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    db.get().run('INSERT INTO warnings (user_id, guild_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
      [target.id, interaction.guild.id, interaction.user.id, reason]);
    const count = db.get().get('SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND guild_id = ?',
      [target.id, interaction.guild.id])?.count || 1;
    const embed = new EmbedBuilder().setColor('#FFA500').setTitle('⚠️ Warning Issued')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Warnings', value: `${count}`, inline: true },
        { name: 'Reason', value: reason }
      ).setTimestamp();
    await target.send({ content: `You have been warned in **${interaction.guild.name}**.\nReason: ${reason}` }).catch(() => {});
    await interaction.reply({ embeds: [embed] });
  },
};
