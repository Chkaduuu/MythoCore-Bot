const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../../database');

function ms(str) {
  const units = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  const match = str.match(/^(\d+)(s|m|h|d|w)$/);
  if (!match) return null;
  return parseInt(match[1]) * units[match[2]] * 1000;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addSubcommand(s => s.setName('start').setDescription('Start a giveaway')
      .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 30m, 1d)').setRequired(true))
      .addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(20))
      .addChannelOption(o => o.setName('channel').setDescription('Channel for giveaway')))
    .addSubcommand(s => s.setName('end').setDescription('End a giveaway early')
      .addStringOption(o => o.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true)))
    .addSubcommand(s => s.setName('reroll').setDescription('Reroll a giveaway')
      .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List active giveaways'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const durationStr = interaction.options.getString('duration');
      const prize = interaction.options.getString('prize');
      const winners = interaction.options.getInteger('winners') || 1;
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const duration = ms(durationStr);
      if (!duration) return interaction.reply({ content: '❌ Invalid duration. Use formats like `1h`, `30m`, `1d`.', ephemeral: true });

      const endsAt = Math.floor((Date.now() + duration) / 1000);
      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle('🎉 GIVEAWAY!')
        .setDescription(`**${prize}**\n\nClick the button below to enter!\n\nEnds: <t:${endsAt}:R>\nWinners: **${winners}**\nHost: ${interaction.user}`)
        .setFooter({ text: `${winners} winner(s)` })
        .setTimestamp(Date.now() + duration);

      const btn = new ButtonBuilder().setCustomId('giveaway:enter').setLabel('🎉 Enter').setStyle(ButtonStyle.Success);
      const row = new ActionRowBuilder().addComponents(btn);

      await interaction.deferReply({ ephemeral: true });
      const msg = await channel.send({ embeds: [embed], components: [row] });

      db.get().run(
        'INSERT INTO giveaways (message_id, channel_id, guild_id, host_id, prize, winners, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [msg.id, channel.id, interaction.guild.id, interaction.user.id, prize, winners, endsAt]
      );

      // Schedule end
      setTimeout(() => endGiveaway(msg.id, client), duration);
      await interaction.editReply({ content: `✅ Giveaway started in ${channel}!` });
    }

    if (sub === 'end') {
      const msgId = interaction.options.getString('message_id');
      await endGiveaway(msgId, client);
      await interaction.reply({ content: '✅ Giveaway ended!', ephemeral: true });
    }

    if (sub === 'reroll') {
      const msgId = interaction.options.getString('message_id');
      const giveaway = db.get().get('SELECT * FROM giveaways WHERE message_id = ?', [msgId]);
      if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });
      const entries = JSON.parse(giveaway.entries || '[]');
      if (!entries.length) return interaction.reply({ content: '❌ No entries.', ephemeral: true });
      const winner = entries[Math.floor(Math.random() * entries.length)];
      await interaction.reply({ content: `🎉 New winner: <@${winner}>! Congratulations!` });
    }

    if (sub === 'list') {
      const giveaways = db.get().query('SELECT * FROM giveaways WHERE guild_id = ? AND ended = 0', [interaction.guild.id]);
      if (!giveaways.length) return interaction.reply({ content: '❌ No active giveaways.', ephemeral: true });
      const embed = new EmbedBuilder().setColor('#FF6B35').setTitle('🎉 Active Giveaways')
        .setDescription(giveaways.map(g => `• **${g.prize}** — Ends <t:${g.ends_at}:R> — [Jump](https://discord.com/channels/${g.guild_id}/${g.channel_id}/${g.message_id})`).join('\n'));
      await interaction.reply({ embeds: [embed] });
    }
  },
};

async function endGiveaway(messageId, client) {
  const giveaway = db.get().get('SELECT * FROM giveaways WHERE message_id = ? AND ended = 0', [messageId]);
  if (!giveaway) return;
  db.get().run('UPDATE giveaways SET ended = 1 WHERE message_id = ?', [messageId]);
  const entries = JSON.parse(giveaway.entries || '[]');
  const guild = client.guilds.cache.get(giveaway.guild_id);
  const channel = guild?.channels.cache.get(giveaway.channel_id);
  if (!channel) return;
  const msg = await channel.messages.fetch(messageId).catch(() => null);

  const shuffled = entries.sort(() => Math.random() - 0.5);
  const winnerIds = shuffled.slice(0, giveaway.winners);
  const winnerMentions = winnerIds.map(id => `<@${id}>`).join(', ');

  const embed = new EmbedBuilder()
    .setColor('#FF0000').setTitle('🎉 GIVEAWAY ENDED!')
    .setDescription(`**${giveaway.prize}**\n\n${winnerIds.length ? `Winners: ${winnerMentions}` : 'No winners (no entries).'}`)
    .setTimestamp();

  if (msg) await msg.edit({ embeds: [embed], components: [] });
  if (winnerIds.length) await channel.send({ content: `🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!` });
}
