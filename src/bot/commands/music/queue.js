const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('View the music queue'),
  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);
    if (!queue?.songs.length) return interaction.reply({ content: '❌ Queue is empty!', ephemeral: true });
    const embed = new EmbedBuilder().setColor('#1DB954').setTitle('🎵 Music Queue')
      .setDescription(queue.songs.slice(0, 10).map((s, i) => `**${i + 1}.** [${s.title}](${s.url})`).join('\n'))
      .setFooter({ text: `${queue.songs.length} songs in queue` });
    await interaction.reply({ embeds: [embed] });
  },
};
