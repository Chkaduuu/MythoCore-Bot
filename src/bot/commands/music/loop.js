const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('loop').setDescription('Toggle loop mode'),
  async execute(interaction, client) {
    const queue = client.musicQueues.get(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Nothing playing!', ephemeral: true });
    queue.loop = !queue.loop;
    await interaction.reply({ content: `🔁 Loop is now **${queue.loop ? 'ON' : 'OFF'}**` });
  },
};
