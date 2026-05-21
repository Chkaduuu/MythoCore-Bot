const db = require('../../database');
const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const guild = newState.guild || oldState.guild;

    // Temp Voice Channels
    try {
      const settings = db.get().get('SELECT * FROM temp_voice_settings WHERE guild_id = ?', [guild.id]);
      if (settings?.create_channel_id && newState.channelId === settings.create_channel_id) {
        const member = newState.member;
        const category = settings.category_id ? guild.channels.cache.get(settings.category_id) : null;
        const channel = await guild.channels.create({
          name: `${member.user.username}'s Channel`,
          type: ChannelType.GuildVoice,
          parent: category,
          permissionOverwrites: [
            { id: member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers] },
          ],
        });
        await member.voice.setChannel(channel);
        db.get().run(
          'INSERT INTO temp_voice (guild_id, channel_id, owner_id) VALUES (?, ?, ?)',
          [guild.id, channel.id, member.id]
        );
      }

      // Delete empty temp voice channels
      if (oldState.channelId) {
        const tmpCh = db.get().get('SELECT * FROM temp_voice WHERE channel_id = ?', [oldState.channelId]);
        if (tmpCh) {
          const channel = guild.channels.cache.get(oldState.channelId);
          if (channel && channel.members.size === 0) {
            await channel.delete().catch(() => {});
            db.get().run('DELETE FROM temp_voice WHERE channel_id = ?', [oldState.channelId]);
          }
        }
      }
    } catch {}

    // Voice Logging
    try {
      const config = db.get().get('SELECT voice_log_channel FROM logs_config WHERE guild_id = ?', [guild.id]);
      if (!config?.voice_log_channel) return;
      const logChannel = guild.channels.cache.get(config.voice_log_channel);
      if (!logChannel) return;

      let description = '';
      const member = newState.member || oldState.member;
      if (!oldState.channelId && newState.channelId) {
        description = `🔊 ${member} joined <#${newState.channelId}>`;
      } else if (oldState.channelId && !newState.channelId) {
        description = `🔇 ${member} left <#${oldState.channelId}>`;
      } else if (oldState.channelId !== newState.channelId) {
        description = `🔀 ${member} moved from <#${oldState.channelId}> to <#${newState.channelId}>`;
      }
      if (!description) return;

      const embed = new EmbedBuilder().setColor('#5865F2').setDescription(description).setTimestamp();
      await logChannel.send({ embeds: [embed] });
    } catch {}
  },
};
