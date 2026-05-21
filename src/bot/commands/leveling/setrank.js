const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrank')
    .setDescription('Customize your rank card')
    .addStringOption(o => o.setName('bg_color').setDescription('Background hex color (e.g. #2C2F33)'))
    .addStringOption(o => o.setName('bar_color').setDescription('XP bar hex color (e.g. #5865F2)'))
    .addStringOption(o => o.setName('text_color').setDescription('Text hex color (e.g. #FFFFFF)')),
  async execute(interaction) {
    const bgColor = interaction.options.getString('bg_color');
    const barColor = interaction.options.getString('bar_color');
    const textColor = interaction.options.getString('text_color');

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (bgColor && !hexRegex.test(bgColor)) return interaction.reply({ content: '❌ Invalid hex color for background.', ephemeral: true });
    if (barColor && !hexRegex.test(barColor)) return interaction.reply({ content: '❌ Invalid hex color for bar.', ephemeral: true });
    if (textColor && !hexRegex.test(textColor)) return interaction.reply({ content: '❌ Invalid hex color for text.', ephemeral: true });

    db.get().run(`INSERT INTO custom_rank_card (user_id, bg_color, bar_color, text_color) VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        bg_color = COALESCE(?, bg_color),
        bar_color = COALESCE(?, bar_color),
        text_color = COALESCE(?, text_color)`,
      [interaction.user.id, bgColor || '#2C2F33', barColor || '#5865F2', textColor || '#FFFFFF',
       bgColor, barColor, textColor]);

    await interaction.reply({ content: '✅ Rank card updated! Use `/rank` to see your card.', ephemeral: true });
  },
};
