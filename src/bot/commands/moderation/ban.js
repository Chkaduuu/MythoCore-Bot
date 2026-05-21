const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the ban'))
    .addIntegerOption(o => o.setName('days').setDescription('Delete messages from last X days (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  cooldown: 5,
  async execute(interaction, client) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ You cannot ban yourself.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ I cannot ban this user.', ephemeral: true });

    try {
      await target.send({ content: `You have been **banned** from **${interaction.guild.name}**.\nReason: ${reason}` }).catch(() => {});
      await target.ban({ reason, deleteMessageSeconds: days * 86400 });

      db.get().run(
        'INSERT INTO cases (type, user_id, guild_id, moderator_id, reason) VALUES (?, ?, ?, ?, ?)',
        ['ban', target.id, interaction.guild.id, interaction.user.id, reason]
      );

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔨 Member Banned')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason }
        ).setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to ban: ${e.message}`, ephemeral: true });
    }
  },
};
