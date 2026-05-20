const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`[MythosCore] Error in command ${interaction.commandName}:`, err);
        const msg = { content: 'An error occurred while executing this command.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
    }

    if (interaction.isButton()) {
      const { customId, guild, user, channel } = interaction;

      if (customId === 'open_ticket') {
        const settings = db.getGuildSettings(guild.id);
        const existing = guild.channels.cache.find(
          c => c.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}` && c.parentId === settings.ticket_category
        );
        if (existing) {
          return interaction.reply({ content: `You already have an open ticket: ${existing}`, ephemeral: true });
        }

        const overwrites = [
          { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ];

        if (settings.ticket_support_role) {
          overwrites.push({
            id: settings.ticket_support_role,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          });
        }

        const ticketChannel = await guild.channels.create({
          name: `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          type: ChannelType.GuildText,
          parent: settings.ticket_category || null,
          permissionOverwrites: overwrites,
        });

        db.createTicket(guild.id, ticketChannel.id, user.id);

        const closeBtn = new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒');

        const row = new ActionRowBuilder().addComponents(closeBtn);

        const embed = new EmbedBuilder()
          .setTitle('🎫 Support Ticket')
          .setDescription(`Hello ${user}, support will be with you shortly.\n\nDescribe your issue below.`)
          .setColor('#5865F2')
          .setTimestamp()
          .setFooter({ text: 'MythosCore Tickets' });

        await ticketChannel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
      }

      if (customId === 'close_ticket') {
        const ticket = db.getTicket(channel.id);
        if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });

        db.closeTicket(channel.id);

        const embed = new EmbedBuilder()
          .setTitle('🔒 Ticket Closed')
          .setDescription(`Ticket closed by ${user}. This channel will be deleted in 5 seconds.`)
          .setColor('#ED4245')
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        setTimeout(() => channel.delete().catch(() => {}), 5000);
      }

      if (customId === 'giveaway_enter') {
        const messageId = interaction.message.id;
        const giveaway = db.getGiveaway(messageId);
        if (!giveaway || giveaway.ended) {
          return interaction.reply({ content: 'This giveaway has already ended.', ephemeral: true });
        }
        const participants = JSON.parse(giveaway.participants || '[]');
        if (participants.includes(user.id)) {
          return interaction.reply({ content: '✅ You are already entered in this giveaway!', ephemeral: true });
        }
        participants.push(user.id);
        db.updateGiveawayParticipants(giveaway.id, participants);

        const embed = EmbedBuilder.from(interaction.message.embeds[0])
          .spliceFields(2, 1, { name: 'Entries', value: `${participants.length}` });

        await interaction.update({ embeds: [embed] });
      }
    }
  },
};
