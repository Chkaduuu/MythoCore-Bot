const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Configure welcome messages')
    .addSubcommand(s => s.setName('channel').setDescription('Set welcome channel')
      .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('message').setDescription('Set welcome message')
      .addStringOption(o => o.setName('message').setDescription('Message (use {user}, {server}, {count})').setRequired(true)))
    .addSubcommand(s => s.setName('image').setDescription('Toggle welcome image')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable image').setRequired(true)))
    .addSubcommand(s => s.setName('test').setDescription('Test welcome message'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    db.get().run('INSERT OR IGNORE INTO welcomer_config (guild_id) VALUES (?)', [interaction.guild.id]);

    if (sub === 'channel') {
      const channel = interaction.options.getChannel('channel');
      db.get().run('UPDATE welcomer_config SET welcome_channel = ? WHERE guild_id = ?', [channel.id, interaction.guild.id]);
      await interaction.reply({ content: `✅ Welcome channel set to ${channel}`, ephemeral: true });
    } else if (sub === 'message') {
      const msg = interaction.options.getString('message');
      db.get().run('UPDATE welcomer_config SET welcome_message = ? WHERE guild_id = ?', [msg, interaction.guild.id]);
      await interaction.reply({ content: `✅ Welcome message set!\nPreview: ${msg.replace(/{user}/g, interaction.user.toString()).replace(/{server}/g, interaction.guild.name).replace(/{count}/g, interaction.guild.memberCount)}`, ephemeral: true });
    } else if (sub === 'image') {
      const enabled = interaction.options.getBoolean('enabled');
      db.get().run('UPDATE welcomer_config SET welcome_image = ? WHERE guild_id = ?', [enabled ? 1 : 0, interaction.guild.id]);
      await interaction.reply({ content: `✅ Welcome image ${enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
    } else if (sub === 'test') {
      const { buildWelcomeEmbed, buildWelcomeImage } = require('../../utils/welcomer');
      const config = db.get().get('SELECT * FROM welcomer_config WHERE guild_id = ?', [interaction.guild.id]);
      const msg = (config?.welcome_message || 'Welcome {user} to **{server}**!')
        .replace(/{user}/g, interaction.user.toString())
        .replace(/{server}/g, interaction.guild.name)
        .replace(/{count}/g, interaction.guild.memberCount);
      if (config?.welcome_image) {
        const att = await buildWelcomeImage(interaction.member);
        if (att) return interaction.reply({ content: msg, files: [att] });
      }
      const embed = buildWelcomeEmbed(interaction.member, msg);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
