const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Auto role settings')
    .addSubcommand(s => s.setName('add').setDescription('Add an auto role').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove auto role').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List auto roles'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'add') {
      const role = interaction.options.getRole('role');
      db.get().run('INSERT INTO auto_roles (guild_id, role_id) VALUES (?, ?)', [interaction.guild.id, role.id]);
      await interaction.reply({ content: `✅ ${role} will now be given to new members.`, ephemeral: true });
    } else if (sub === 'remove') {
      const role = interaction.options.getRole('role');
      db.get().run('DELETE FROM auto_roles WHERE guild_id = ? AND role_id = ?', [interaction.guild.id, role.id]);
      await interaction.reply({ content: `✅ Removed ${role} from auto roles.`, ephemeral: true });
    } else {
      const roles = db.get().query('SELECT role_id FROM auto_roles WHERE guild_id = ?', [interaction.guild.id]);
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎭 Auto Roles')
        .setDescription(roles.length ? roles.map(r => `<@&${r.role_id}>`).join('\n') : 'No auto roles configured.');
      await interaction.reply({ embeds: [embed] });
    }
  },
};
