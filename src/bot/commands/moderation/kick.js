const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ I cannot kick this user.', ephemeral: true });
    await target.send({ content: `You have been **kicked** from **${interaction.guild.name}**.\nReason: ${reason}` }).catch(() => {});
    await target.kick(reason);
    db.get().run('INSERT INTO cases (type, user_id, guild_id, moderator_id, reason) VALUES (?, ?, ?, ?, ?)',
      ['kick', target.id, interaction.guild.id, interaction.user.id, reason]);
    const embed = new EmbedBuilder().setColor('#FFA500').setTitle('👢 Member Kicked')
      .addFields(
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
