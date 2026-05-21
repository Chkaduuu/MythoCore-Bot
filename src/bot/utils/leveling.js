const db = require('../../database');
const { EmbedBuilder } = require('discord.js');

const XP_COOLDOWN = new Map();
const XP_COOLDOWN_MS = 60000;
const XP_MIN = 15, XP_MAX = 40;

function calcLevelXP(level) {
  return 5 * level * level + 50 * level + 100;
}

async function handleXP(message, client) {
  const userId = message.author.id;
  const guildId = message.guild.id;
  const key = `${userId}-${guildId}`;

  if (XP_COOLDOWN.has(key)) return;
  XP_COOLDOWN.set(key, true);
  setTimeout(() => XP_COOLDOWN.delete(key), XP_COOLDOWN_MS);

  const xpGain = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;

  db.get().run(
    `INSERT INTO users (id, guild_id, xp, level) VALUES (?, ?, ?, 1)
     ON CONFLICT(id, guild_id) DO UPDATE SET xp = xp + ?`,
    [userId, guildId, xpGain, xpGain]
  );

  const user = db.get().get('SELECT * FROM users WHERE id = ? AND guild_id = ?', [userId, guildId]);
  if (!user) return;

  const required = calcLevelXP(user.level);
  if (user.xp >= required) {
    const newLevel = user.level + 1;
    db.get().run('UPDATE users SET level = ?, xp = 0 WHERE id = ? AND guild_id = ?', [newLevel, userId, guildId]);

    // Level up message
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setDescription(`🎉 ${message.author} leveled up to **Level ${newLevel}**!`)
      .setThumbnail(message.author.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });

    // Level role rewards
    const rewards = db.get().query(
      'SELECT role_id FROM level_roles WHERE guild_id = ? AND required_level <= ? ORDER BY required_level DESC',
      [guildId, newLevel]
    );
    for (const { role_id } of rewards) {
      const role = message.guild.roles.cache.get(role_id);
      if (role && !message.member.roles.cache.has(role_id)) {
        await message.member.roles.add(role).catch(() => {});
      }
    }
  }
}

module.exports = { handleXP, calcLevelXP };
