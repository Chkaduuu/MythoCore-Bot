const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const https = require('https');
module.exports = {
  data: new SlashCommandBuilder().setName('meme').setDescription('Get a random meme'),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await new Promise((res, rej) => {
        https.get('https://meme-api.com/gimme', resp => {
          let d = '';
          resp.on('data', c => d += c);
          resp.on('end', () => { try { res(JSON.parse(d)); } catch { rej(new Error('parse error')); } });
        }).on('error', rej);
      });
      const embed = new EmbedBuilder().setColor('#FF6B35').setTitle(data.title).setImage(data.url)
        .setFooter({ text: `👍 ${data.ups} · r/${data.subreddit}` });
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: '❌ Failed to fetch a meme.' });
    }
  },
};
