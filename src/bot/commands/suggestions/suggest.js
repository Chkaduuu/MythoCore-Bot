const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggestion system')
    .addSubcommand(s => s.setName('create').setDescription('Create a suggestion')
      .addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true)))
    .addSubcommand(s => s.setName('accept').setDescription('Accept a suggestion')
      .addIntegerOption(o => o.setName('id').setDescription('Suggestion ID').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason')))
    .addSubcommand(s => s.setName('deny').setDescription('Deny a suggestion')
      .addIntegerOption(o => o.setName('id').setDescription('Suggestion ID').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason')))
    .addSubcommand(s => s.setName('setchannel').setDescription('Set suggestions channel')
      .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setchannel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Missing permissions.', ephemeral: true });
      const channel = interaction.options.getChannel('channel');
      db.get().run('INSERT OR REPLACE INTO guilds (id, settings) VALUES (?, json_set(COALESCE((SELECT settings FROM guilds WHERE id = ?), "{}"), "$.suggestions_channel", ?))',
        [interaction.guild.id, interaction.guild.id, channel.id]);
      return interaction.reply({ content: `✅ Suggestions channel set to ${channel}`, ephemeral: true });
    }

    if (sub === 'create') {
      const content = interaction.options.getString('suggestion');
      const guildData = db.get().get('SELECT settings FROM guilds WHERE id = ?', [interaction.guild.id]);
      const settings = guildData ? JSON.parse(guildData.settings || '{}') : {};
      const channelId = settings.suggestions_channel;
      const channel = channelId ? interaction.guild.channels.cache.get(channelId) : interaction.channel;
      if (!channel) return interaction.reply({ content: '❌ Suggestions channel not configured.', ephemeral: true });

      const result = db.get().run('INSERT INTO suggestions (guild_id, channel_id, author_id, content) VALUES (?, ?, ?, ?)',
        [interaction.guild.id, channel.id, interaction.user.id, content]);
      const id = result.lastInsertRowid;

      const embed = new EmbedBuilder().setColor('#FFA500').setTitle(`💡 Suggestion #${id}`)
        .setDescription(content).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .addFields({ name: 'Status', value: '⏳ Pending' }).setTimestamp();

      const upBtn = new ButtonBuilder().setCustomId(`suggestion:upvote:${id}`).setLabel('👍 Upvote').setStyle(ButtonStyle.Success);
      const downBtn = new ButtonBuilder().setCustomId(`suggestion:downvote:${id}`).setLabel('👎 Downvote').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(upBtn, downBtn);

      const msg = await channel.send({ embeds: [embed], components: [row] });
      db.get().run('UPDATE suggestions SET message_id = ? WHERE id = ?', [msg.id, id]);
      await interaction.reply({ content: `✅ Suggestion #${id} submitted!`, ephemeral: true });
    }

    if (sub === 'accept' || sub === 'deny') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Missing permissions.', ephemeral: true });
      const id = interaction.options.getInteger('id');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const status = sub === 'accept' ? 'accepted' : 'denied';
      const color = sub === 'accept' ? '#00FF00' : '#FF0000';
      const suggestion = db.get().get('SELECT * FROM suggestions WHERE id = ? AND guild_id = ?', [id, interaction.guild.id]);
      if (!suggestion) return interaction.reply({ content: '❌ Suggestion not found.', ephemeral: true });
      db.get().run('UPDATE suggestions SET status = ? WHERE id = ?', [status, id]);
      const channel = interaction.guild.channels.cache.get(suggestion.channel_id);
      if (channel && suggestion.message_id) {
        const msg = await channel.messages.fetch(suggestion.message_id).catch(() => null);
        if (msg) {
          const embed = EmbedBuilder.from(msg.embeds[0]).setColor(color)
            .spliceFields(0, 1, { name: 'Status', value: sub === 'accept' ? `✅ Accepted by ${interaction.user.tag}` : `❌ Denied by ${interaction.user.tag}` })
            .addFields({ name: 'Reason', value: reason });
          await msg.edit({ embeds: [embed], components: [] });
        }
      }
      await interaction.reply({ content: `✅ Suggestion #${id} ${status}.`, ephemeral: true });
    }
  },
};
