const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or another user\'s balance')
    .addUserOption(o => o.setName('user').setDescription('User to check')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    let user = db.get().get('SELECT * FROM users WHERE id = ? AND guild_id = ?', [target.id, interaction.guild.id]);
    if (!user) {
      db.get().run('INSERT OR IGNORE INTO users (id, guild_id) VALUES (?, ?)', [target.id, interaction.guild.id]);
      user = { balance: 0, bank: 0 };
    }
    const embed = new EmbedBuilder().setColor('#FFD700').setTitle(`💰 ${target.username}'s Balance`)
      .addFields(
        { name: '👛 Wallet', value: `${user.balance.toLocaleString()} coins`, inline: true },
        { name: '🏦 Bank', value: `${user.bank.toLocaleString()} coins`, inline: true },
        { name: '💎 Total', value: `${(user.balance + user.bank).toLocaleString()} coins`, inline: true }
      ).setThumbnail(target.displayAvatarURL());
    await interaction.reply({ embeds: [embed] });
  },
};
