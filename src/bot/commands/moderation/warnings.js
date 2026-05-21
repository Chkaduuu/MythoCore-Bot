const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warns = db.get().query('SELECT * FROM warnings WHERE user_id = ? AND guild_id = ? ORDER BY created_at DESC LIMIT 10',
      [target.id, interaction.guild.id]);
    const embed = new EmbedBuilder().setColor('#FFA500').setTitle(`⚠️ Warnings for ${target.tag}`)
      .setDescription(warns.length ? warns.map((w, i) => `**${i + 1}.** ${w.reason} — <t:${w.created_at}:R>`).join('\n') : 'No warnings found.')
      .setFooter({ text: `Total: ${warns.length}` });
    await interaction.reply({ embeds: [embed] });
  },
};
