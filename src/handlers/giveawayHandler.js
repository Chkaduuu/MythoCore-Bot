const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');

function startGiveawayChecker(client) {
  setInterval(async () => {
    const now = Math.floor(Date.now() / 1000);
    const giveaways = db.getActiveGiveaways();

    for (const giveaway of giveaways) {
      if (now >= giveaway.ends_at) {
        await endGiveaway(client, giveaway);
      }
    }
  }, 15000);
}

async function endGiveaway(client, giveaway) {
  try {
    db.endGiveaway(giveaway.id);
    const guild = client.guilds.cache.get(giveaway.guild_id);
    if (!guild) return;

    const channel = guild.channels.cache.get(giveaway.channel_id);
    if (!channel) return;

    const participants = JSON.parse(giveaway.participants || '[]');
    const winnerCount = Math.min(giveaway.winners, participants.length);
    const winners = [];

    const pool = [...participants];
    for (let i = 0; i < winnerCount; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }

    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway Ended!')
      .setColor('#FFD700')
      .setDescription(`**Prize:** ${giveaway.prize}`)
      .addFields(
        {
          name: 'Winners',
          value: winners.length > 0
            ? winners.map(id => `<@${id}>`).join(', ')
            : 'No valid participants.',
        },
        { name: 'Total Entries', value: `${participants.length}` }
      )
      .setTimestamp()
      .setFooter({ text: 'MythosCore Giveaways' });

    try {
      const msg = await channel.messages.fetch(giveaway.message_id);
      await msg.edit({ embeds: [embed], components: [] });
    } catch {}

    if (winners.length > 0) {
      await channel.send(`🎉 Congratulations ${winners.map(id => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**!`);
    } else {
      await channel.send(`The giveaway for **${giveaway.prize}** has ended with no participants.`);
    }
  } catch (err) {
    console.error('[GiveawayHandler] Error ending giveaway:', err);
  }
}

module.exports = { startGiveawayChecker, endGiveaway };
