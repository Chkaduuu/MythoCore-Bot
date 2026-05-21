const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Manage reaction roles')
    .addSubcommand(s => s.setName('add').setDescription('Add a reaction role')
      .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true))
      .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true))
      .addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
      .addStringOption(o => o.setName('type').setDescription('Type').addChoices(
        { name: 'Normal', value: 'normal' }, { name: 'Unique', value: 'unique' }, { name: 'Verify', value: 'verify' }
      )))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a reaction role')
      .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true))
      .addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List reaction roles'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'add') {
      const channel = interaction.options.getChannel('channel');
      const msgId = interaction.options.getString('message_id');
      const emoji = interaction.options.getString('emoji');
      const role = interaction.options.getRole('role');
      const type = interaction.options.getString('type') || 'normal';
      const msg = await channel.messages.fetch(msgId).catch(() => null);
      if (!msg) return interaction.reply({ content: '❌ Message not found.', ephemeral: true });
      await msg.react(emoji).catch(() => {});
      db.get().run('INSERT INTO reaction_roles (guild_id, channel_id, message_id, emoji, role_id, type) VALUES (?, ?, ?, ?, ?, ?)',
        [interaction.guild.id, channel.id, msgId, emoji, role.id, type]);
      await interaction.reply({ content: `✅ Added reaction role: ${emoji} → ${role}`, ephemeral: true });
    } else if (sub === 'remove') {
      const msgId = interaction.options.getString('message_id');
      const emoji = interaction.options.getString('emoji');
      db.get().run('DELETE FROM reaction_roles WHERE message_id = ? AND emoji = ? AND guild_id = ?', [msgId, emoji, interaction.guild.id]);
      await interaction.reply({ content: '✅ Reaction role removed.', ephemeral: true });
    } else {
      const rrs = db.get().query('SELECT * FROM reaction_roles WHERE guild_id = ?', [interaction.guild.id]);
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎭 Reaction Roles')
        .setDescription(rrs.length ? rrs.map(r => `${r.emoji} → <@&${r.role_id}> (${r.type})`).join('\n') : 'None configured.');
      await interaction.reply({ embeds: [embed] });
    }
  },
};
