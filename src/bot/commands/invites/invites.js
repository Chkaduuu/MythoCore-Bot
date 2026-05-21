const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Check invite stats')
    .addSubcommand(s => s.setName('check').setDescription('Check your invites').addUserOption(o => o.setName('user').setDescription('User to check')))
    .addSubcommand(s => s.setName('leaderboard').setDescription('Top inviters')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'check') {
      const target = interaction.options.getUser('user') || interaction.user;
      const rows = db.get().query('SELECT * FROM invite_tracker WHERE guild_id = ? AND inviter_id = ?', [interaction.guild.id, target.id]);
      const total = rows.reduce((a, r) => a + r.total_invited, 0);
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`📨 ${target.username}'s Invites`)
        .addFields({ name: 'Total Invited', value: `${total}`, inline: true });
      await interaction.reply({ embeds: [embed] });
    } else {
      const rows = db.get().query(
        'SELECT inviter_id, SUM(total_invited) as total FROM invite_tracker WHERE guild_id = ? GROUP BY inviter_id ORDER BY total DESC LIMIT 10',
        [interaction.guild.id]
      );
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('📨 Invite Leaderboard')
        .setDescription(rows.map((r, i) => `**${i + 1}.** <@${r.inviter_id}> — ${r.total} invites`).join('\n') || 'No data yet.');
      await interaction.reply({ embeds: [embed] });
    }
  },
};
