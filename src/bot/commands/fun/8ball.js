const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const responses = ['It is certain.','It is decidedly so.','Without a doubt.','Yes definitely.','You may rely on it.','As I see it, yes.','Most likely.','Outlook good.','Yes.','Signs point to yes.','Reply hazy, try again.','Ask again later.','Better not tell you now.','Cannot predict now.','Concentrate and ask again.','Don\'t count on it.','My reply is no.','My sources say no.','Outlook not so good.','Very doubtful.'];
module.exports = {
  data: new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8ball')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
  async execute(interaction) {
    const q = interaction.options.getString('question');
    const answer = responses[Math.floor(Math.random() * responses.length)];
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🎱 Magic 8Ball')
      .addFields({ name: '❓ Question', value: q }, { name: '🔮 Answer', value: answer });
    await interaction.reply({ embeds: [embed] });
  },
};
