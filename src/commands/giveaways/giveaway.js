const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');
const { endGiveaway } = require('../../handlers/giveawayHandler');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Giveaway management commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Start a new giveaway.')
        .addStringOption(opt => opt.setName('prize').setDescription('What is the prize?').setRequired(true))
        .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 1h, 30m, 1d)').setRequired(true))
        .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20))
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel for the giveaway').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('end')
        .setDescription('End a giveaway early by message ID.')
        .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('reroll')
        .setDescription('Reroll winners for an ended giveaway.')
        .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const durationStr = interaction.options.getString('duration');
      const winners = interaction.options.getInteger('winners') || 1;
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      const duration = ms(durationStr);
      if (!duration) {
        return interaction.reply({ content: '❌ Invalid duration. Use formats like `10m`, `1h`, `2d`.', ephemeral: true });
      }

      const endsAt = Math.floor((Date.now() + duration) / 1000);
      const endsAtDate = new Date(Date.now() + duration);

      const enterBtn = new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('Enter Giveaway')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎉');

      const row = new ActionRowBuilder().addComponents(enterBtn);

      const embed = new EmbedBuilder()
        .setTitle('🎉 Giveaway!')
        .setDescription(`**Prize:** ${prize}`)
        .setColor('#FFD700')
        .addFields(
          { name: 'Hosted By', value: `${interaction.user}`, inline: true },
          { name: 'Winners', value: `${winners}`, inline: true },
          { name: 'Entries', value: '0', inline: true },
          { name: 'Ends At', value: `<t:${endsAt}:R> (<t:${endsAt}:f>)`, inline: false }
        )
        .setTimestamp(endsAtDate)
        .setFooter({ text: 'MythosCore Giveaways • Ends at' });

      const msg = await channel.send({ embeds: [embed], components: [row] });

      const id = db.createGiveaway({
        guildId: interaction.guild.id,
        channelId: channel.id,
        hostId: interaction.user.id,
        prize,
        winners,
        endsAt,
      });
      db.updateGiveawayMessageId(id, msg.id);

      await interaction.reply({ content: `✅ Giveaway started in ${channel}!`, ephemeral: true });
    }

    if (sub === 'end') {
      const messageId = interaction.options.getString('message_id');
      const giveaway = db.getGiveaway(messageId);

      if (!giveaway || giveaway.guild_id !== interaction.guild.id) {
        return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });
      }
      if (giveaway.ended) {
        return interaction.reply({ content: '❌ This giveaway has already ended.', ephemeral: true });
      }

      await endGiveaway(interaction.client, giveaway);
      await interaction.reply({ content: '✅ Giveaway ended!', ephemeral: true });
    }

    if (sub === 'reroll') {
      const messageId = interaction.options.getString('message_id');
      const giveaway = db.getGiveaway(messageId);

      if (!giveaway || giveaway.guild_id !== interaction.guild.id) {
        return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });
      }
      if (!giveaway.ended) {
        return interaction.reply({ content: '❌ This giveaway has not ended yet.', ephemeral: true });
      }

      const participants = JSON.parse(giveaway.participants || '[]');
      if (participants.length === 0) {
        return interaction.reply({ content: '❌ No participants to reroll.', ephemeral: true });
      }

      const winner = participants[Math.floor(Math.random() * participants.length)];
      const channel = interaction.guild.channels.cache.get(giveaway.channel_id);

      if (channel) {
        await channel.send(`🎉 Reroll! The new winner of **${giveaway.prize}** is <@${winner}>! Congratulations!`);
      }
      await interaction.reply({ content: `✅ Rerolled! New winner: <@${winner}>`, ephemeral: true });
    }
  },
};
