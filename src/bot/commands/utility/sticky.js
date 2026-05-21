const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Sticky messages')
    .addSubcommand(s => s.setName('set').setDescription('Set sticky message')
      .addStringOption(o => o.setName('message').setDescription('Message content').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove sticky message'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'set') {
      const content = interaction.options.getString('message');
      db.get().run('INSERT OR REPLACE INTO sticky_messages (guild_id, channel_id, content) VALUES (?, ?, ?)',
        [interaction.guild.id, interaction.channel.id, content]);
      const msg = await interaction.channel.send({ content });
      db.get().run('UPDATE sticky_messages SET last_message_id = ? WHERE channel_id = ?', [msg.id, interaction.channel.id]);
      await interaction.reply({ content: '✅ Sticky message set!', ephemeral: true });
    } else {
      db.get().run('DELETE FROM sticky_messages WHERE channel_id = ? AND guild_id = ?', [interaction.channel.id, interaction.guild.id]);
      await interaction.reply({ content: '✅ Sticky message removed.', ephemeral: true });
    }
  },
};
