const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

const categories = {
  moderation: { emoji: '🔨', desc: 'ban, kick, warn, mute, purge, timeout' },
  economy: { emoji: '💰', desc: 'balance, daily, work, pay, shop, leaderboard' },
  leveling: { emoji: '⭐', desc: 'rank, setrank, setlevelrole, xp leaderboard' },
  music: { emoji: '🎵', desc: 'play, skip, stop, queue, loop, volume' },
  fun: { emoji: '🎮', desc: 'coinflip, 8ball, dice, rps, meme' },
  giveaway: { emoji: '🎉', desc: 'giveaway start/end/reroll/list' },
  utility: { emoji: '🛠️', desc: 'help, ping, userinfo, serverinfo, embed' },
  welcomer: { emoji: '👋', desc: 'setwelcome, setleave' },
  automod: { emoji: '🤖', desc: 'automod setup, config' },
  suggestions: { emoji: '💡', desc: 'suggest, suggestion accept/deny' },
  applications: { emoji: '📋', desc: 'apply, application create/list' },
  invites: { emoji: '📨', desc: 'invites, inviteleaderboard' },
  logging: { emoji: '📝', desc: 'setlog' },
  reactionroles: { emoji: '🎭', desc: 'reactionrole add/remove' },
  tempvc: { emoji: '🔊', desc: 'tempvc setup, rename, limit' },
};

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('View all commands and features'),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`${client.user.username} — Command Help`)
      .setDescription('A feature-rich Discord bot. Select a category to see commands.')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        Object.entries(categories).map(([cat, info]) => ({
          name: `${info.emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
          value: info.desc,
          inline: true,
        }))
      )
      .setFooter({ text: `${client.commands.size} total commands loaded` });

    await interaction.reply({ embeds: [embed] });
  },
};
