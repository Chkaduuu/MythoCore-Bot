const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

function buildWelcomeEmbed(member, message) {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(message)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();
}

async function buildWelcomeImage(member) {
  try {
    const { createCanvas, loadImage } = require('canvas');
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, 700, 250);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Welcome, ${member.user.username}!`, 420, 120);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#99AAB5';
    ctx.fillText(`You are member #${member.guild.memberCount}`, 420, 160);
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 25, 25, 200, 200);
    ctx.restore();
    return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
  } catch {
    return null;
  }
}

module.exports = { buildWelcomeEmbed, buildWelcomeImage };
