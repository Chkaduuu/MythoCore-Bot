const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Configure logging channels')
    .addStringOption(o => o.setName('type').setDescription('Log type').setRequired(true).addChoices(
      { name: 'Moderation', value: 'mod_log_channel' },
      { name: 'Members', value: 'member_log_channel' },
      { name: 'Messages', value: 'message_log_channel' },
      { name: 'Voice', value: 'voice_log_channel' },
      { name: 'Server', value: 'server_log_channel' }
    ))
    .addChannelOption(o => o.setName('channel').setDescription('Channel (leave empty to disable)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');
    db.get().run('INSERT OR IGNORE INTO logs_config (guild_id) VALUES (?)', [interaction.guild.id]);
    db.get().run(`UPDATE logs_config SET ${type} = ? WHERE guild_id = ?`, [channel?.id || null, interaction.guild.id]);
    await interaction.reply({ content: channel ? `✅ ${type.replace(/_/g, ' ')} set to ${channel}` : `✅ ${type.replace(/_/g, ' ')} disabled.`, ephemeral: true });
  },
};
