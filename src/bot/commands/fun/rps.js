const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
module.exports = {
  data: new SlashCommandBuilder().setName('rps').setDescription('Play Rock, Paper, Scissors')
    .addStringOption(o => o.setName('choice').setDescription('Your choice').setRequired(true)
      .addChoices({ name: '🪨 Rock', value: 'rock' }, { name: '📄 Paper', value: 'paper' }, { name: '✂️ Scissors', value: 'scissors' })),
  async execute(interaction) {
    const player = interaction.options.getString('choice');
    const bot = choices[Math.floor(Math.random() * choices.length)];
    let result;
    if (player === bot) result = "🤝 It's a tie!";
    else if ((player === 'rock' && bot === 'scissors') || (player === 'paper' && bot === 'rock') || (player === 'scissors' && bot === 'paper')) result = '🎉 You win!';
    else result = '😢 You lose!';
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎮 Rock, Paper, Scissors')
      .addFields({ name: 'You', value: `${emojis[player]} ${player}`, inline: true }, { name: 'Bot', value: `${emojis[bot]} ${bot}`, inline: true }, { name: 'Result', value: result });
    await interaction.reply({ embeds: [embed] });
  },
};
