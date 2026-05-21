const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');
const { calcLevelXP } = require('../../utils/leveling');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your or another user\'s rank card')
    .addUserOption(o => o.setName('user').setDescription('User to check')),
  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.member;
    const user = db.get().get('SELECT * FROM users WHERE id = ? AND guild_id = ?', [target.id, interaction.guild.id]) || { xp: 0, level: 1 };
    const rankCard = db.get().get('SELECT * FROM custom_rank_card WHERE user_id = ?', [target.id]);
    const required = calcLevelXP(user.level);

    try {
      const { createCanvas, loadImage } = require('canvas');
      const canvas = createCanvas(800, 200);
      const ctx = canvas.getContext('2d');

      const bgColor = rankCard?.bg_color || '#2C2F33';
      const textColor = rankCard?.text_color || '#FFFFFF';
      const barColor = rankCard?.bar_color || '#5865F2';

      ctx.fillStyle = bgColor;
      ctx.roundRect(0, 0, 800, 200, 20);
      ctx.fill();

      // XP Bar background
      ctx.fillStyle = '#3A3F44';
      ctx.roundRect(220, 140, 540, 25, 12);
      ctx.fill();

      // XP Bar fill
      const progress = Math.min(user.xp / required, 1);
      ctx.fillStyle = barColor;
      ctx.roundRect(220, 140, 540 * progress, 25, 12);
      ctx.fill();

      // Avatar
      const avatar = await loadImage(target.user.displayAvatarURL({ extension: 'png', size: 256 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(110, 100, 80, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 30, 20, 160, 160);
      ctx.restore();

      // Text
      ctx.fillStyle = textColor;
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(target.user.username, 225, 80);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#99AAB5';
      ctx.fillText(`Level ${user.level}`, 225, 115);
      ctx.fillText(`${user.xp} / ${required} XP`, 540, 115);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
      await interaction.reply({ files: [attachment] });
    } catch {
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`📊 ${target.user.username}'s Rank`)
        .addFields(
          { name: 'Level', value: `${user.level}`, inline: true },
          { name: 'XP', value: `${user.xp} / ${required}`, inline: true }
        );
      await interaction.reply({ embeds: [embed] });
    }
  },
};
