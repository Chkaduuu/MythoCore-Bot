const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop music and clear queue'),
  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true });
    queue.songs = [];
    queue.player.stop();
    queue.connection.destroy();
    client.musicQueues.delete(interaction.guild.id);
    await interaction.reply({ content: '⏹️ Music stopped and queue cleared.' });
  },
};
