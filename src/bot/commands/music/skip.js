const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Skip the current song'),
  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);
    if (!queue || !queue.songs.length) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true });
    queue.player.stop();
    await interaction.reply({ content: `⏭️ Skipped **${queue.songs[0]?.title}**` });
  },
};
