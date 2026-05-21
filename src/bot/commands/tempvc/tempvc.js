const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvc')
    .setDescription('Temporary voice channels')
    .addSubcommand(s => s.setName('setup').setDescription('Setup temp voice system')
      .addChannelOption(o => o.setName('category').setDescription('Category for channels').setRequired(true)))
    .addSubcommand(s => s.setName('rename').setDescription('Rename your channel').addStringOption(o => o.setName('name').setDescription('New name').setRequired(true)))
    .addSubcommand(s => s.setName('limit').setDescription('Set user limit').addIntegerOption(o => o.setName('limit').setDescription('0 = unlimited').setRequired(true).setMinValue(0).setMaxValue(99)))
    .addSubcommand(s => s.setName('lock').setDescription('Lock/unlock your channel'))
    .addSubcommand(s => s.setName('kick').setDescription('Kick user from your channel').addUserOption(o => o.setName('user').setDescription('User').setRequired(true))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Missing permissions.', ephemeral: true });
      const category = interaction.options.getChannel('category');
      const createChannel = await interaction.guild.channels.create({
        name: '➕ Create Voice',
        type: ChannelType.GuildVoice,
        parent: category,
      });
      db.get().run('INSERT OR REPLACE INTO temp_voice_settings (guild_id, category_id, create_channel_id) VALUES (?, ?, ?)',
        [interaction.guild.id, category.id, createChannel.id]);
      await interaction.reply({ content: `✅ Temp VC setup complete! Join ${createChannel} to create your channel.`, ephemeral: true });
    }

    if (['rename', 'limit', 'lock', 'kick'].includes(sub)) {
      const myChannel = db.get().get('SELECT * FROM temp_voice WHERE owner_id = ? AND guild_id = ?', [interaction.user.id, interaction.guild.id]);
      if (!myChannel) return interaction.reply({ content: '❌ You don\'t own a temp channel.', ephemeral: true });
      const ch = interaction.guild.channels.cache.get(myChannel.channel_id);
      if (!ch) return interaction.reply({ content: '❌ Channel not found.', ephemeral: true });

      if (sub === 'rename') {
        await ch.setName(interaction.options.getString('name'));
        await interaction.reply({ content: `✅ Channel renamed.`, ephemeral: true });
      } else if (sub === 'limit') {
        await ch.setUserLimit(interaction.options.getInteger('limit'));
        await interaction.reply({ content: `✅ User limit updated.`, ephemeral: true });
      } else if (sub === 'lock') {
        const isLocked = ch.permissionOverwrites.cache.get(interaction.guild.id)?.deny.has('Connect');
        await ch.permissionOverwrites.edit(interaction.guild.id, { Connect: isLocked ? null : false });
        await interaction.reply({ content: `✅ Channel ${isLocked ? 'unlocked' : 'locked'}.`, ephemeral: true });
      } else if (sub === 'kick') {
        const target = interaction.options.getMember('user');
        if (target?.voice.channelId === ch.id) await target.voice.disconnect('Kicked from temp channel');
        await interaction.reply({ content: `✅ ${target?.user.username} kicked.`, ephemeral: true });
      }
    }
  },
};
