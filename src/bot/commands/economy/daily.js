const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily reward'),
  cooldown: 3,
  async execute(interaction) {
    db.get().run('INSERT OR IGNORE INTO users (id, guild_id) VALUES (?, ?)', [interaction.user.id, interaction.guild.id]);
    const user = db.get().get('SELECT * FROM users WHERE id = ? AND guild_id = ?', [interaction.user.id, interaction.guild.id]);
    const now = Math.floor(Date.now() / 1000);
    const cooldown = 86400;
    if (user.last_daily && now - user.last_daily < cooldown) {
      const remaining = cooldown - (now - user.last_daily);
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      return interaction.reply({ content: `⏳ Come back in **${hours}h ${minutes}m** to claim your daily!`, ephemeral: true });
    }
    const reward = Math.floor(Math.random() * 500) + 200;
    db.get().run('UPDATE users SET balance = balance + ?, last_daily = ? WHERE id = ? AND guild_id = ?',
      [reward, now, interaction.user.id, interaction.guild.id]);
    const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🎁 Daily Reward Claimed!')
      .setDescription(`You received **${reward.toLocaleString()} coins**!`).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
