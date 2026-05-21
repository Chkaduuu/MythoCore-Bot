const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('dice').setDescription('Roll dice')
    .addIntegerOption(o => o.setName('sides').setDescription('Number of sides').setMinValue(2).setMaxValue(100))
    .addIntegerOption(o => o.setName('count').setDescription('Number of dice').setMinValue(1).setMaxValue(10)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const count = interaction.options.getInteger('count') || 1;
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    const embed = new EmbedBuilder().setColor('#FF6B35').setTitle(`🎲 Dice Roll (d${sides} × ${count})`)
      .addFields({ name: 'Results', value: rolls.join(', '), inline: true }, { name: 'Total', value: `${total}`, inline: true });
    await interaction.reply({ embeds: [embed] });
  },
};
