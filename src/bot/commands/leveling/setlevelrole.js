const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevelrole')
    .setDescription('Set a role reward for reaching a level')
    .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
    .addIntegerOption(o => o.setName('level').setDescription('Required level').setRequired(true).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const level = interaction.options.getInteger('level');
    db.get().run('INSERT OR REPLACE INTO level_roles (guild_id, role_id, required_level) VALUES (?, ?, ?)',
      [interaction.guild.id, role.id, level]);
    const embed = new EmbedBuilder().setColor('#5865F2')
      .setDescription(`✅ ${role} will now be assigned when members reach **Level ${level}**.`);
    await interaction.reply({ embeds: [embed] });
  },
};
