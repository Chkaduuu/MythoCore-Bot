const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🌑';
    const embed = new EmbedBuilder().setColor('#FFD700').setDescription(`The coin landed on **${result}**!`);
    await interaction.reply({ embeds: [embed] });
  },
};
