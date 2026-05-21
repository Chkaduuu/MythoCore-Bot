const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View server leaderboards')
    .addStringOption(o => o.setName('type').setDescription('Leaderboard type')
      .addChoices(
        { name: '💰 Economy', value: 'economy' },
        { name: '⭐ Levels', value: 'levels' },
        { name: '💬 Messages', value: 'messages' }
      )),
  async execute(interaction) {
    const type = interaction.options.getString('type') || 'economy';
    let users, title, description;

    if (type === 'economy') {
      users = db.get().query('SELECT * FROM users WHERE guild_id = ? ORDER BY balance + bank DESC LIMIT 10', [interaction.guild.id]);
      title = '💰 Economy Leaderboard';
      description = users.map((u, i) => `**${i + 1}.** <@${u.id}> — ${(u.balance + u.bank).toLocaleString()} coins`).join('\n');
    } else if (type === 'levels') {
      users = db.get().query('SELECT * FROM users WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT 10', [interaction.guild.id]);
      title = '⭐ Levels Leaderboard';
      description = users.map((u, i) => `**${i + 1}.** <@${u.id}> — Level ${u.level} (${u.xp} XP)`).join('\n');
    } else {
      users = db.get().query('SELECT * FROM users WHERE guild_id = ? ORDER BY messages DESC LIMIT 10', [interaction.guild.id]);
      title = '💬 Messages Leaderboard';
      description = users.map((u, i) => `**${i + 1}.** <@${u.id}> — ${u.messages.toLocaleString()} messages`).join('\n');
    }

    const embed = new EmbedBuilder().setColor('#FFD700').setTitle(title)
      .setDescription(description || 'No data yet.').setFooter({ text: interaction.guild.name })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
