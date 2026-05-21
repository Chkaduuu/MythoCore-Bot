const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

const jobs = ['programmer', 'chef', 'doctor', 'teacher', 'driver', 'farmer', 'artist', 'musician'];

module.exports = {
  data: new SlashCommandBuilder().setName('work').setDescription('Work to earn coins'),
  async execute(interaction) {
    db.get().run('INSERT OR IGNORE INTO users (id, guild_id) VALUES (?, ?)', [interaction.user.id, interaction.guild.id]);
    const user = db.get().get('SELECT * FROM users WHERE id = ? AND guild_id = ?', [interaction.user.id, interaction.guild.id]);
    const now = Math.floor(Date.now() / 1000);
    if (user.last_work && now - user.last_work < 3600) {
      const remaining = 3600 - (now - user.last_work);
      return interaction.reply({ content: `⏳ You need to rest! Come back in **${Math.floor(remaining / 60)}m**`, ephemeral: true });
    }
    const earned = Math.floor(Math.random() * 200) + 50;
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    db.get().run('UPDATE users SET balance = balance + ?, last_work = ? WHERE id = ? AND guild_id = ?',
      [earned, now, interaction.user.id, interaction.guild.id]);
    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('💼 Work Complete!')
      .setDescription(`You worked as a **${job}** and earned **${earned} coins**!`).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
