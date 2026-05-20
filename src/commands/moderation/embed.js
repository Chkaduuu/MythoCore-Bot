const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create and send a custom embed message.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('title').setDescription('Embed title').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('description').setDescription('Embed description').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('color')
        .setDescription('Embed color as hex (e.g. #5865F2)')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('footer').setDescription('Footer text').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('image').setDescription('Image URL for the embed').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('thumbnail').setDescription('Thumbnail URL').setRequired(false)
    )
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel to send to (default: current)').setRequired(false)
    ),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#5865F2';
    const footer = interaction.options.getString('footer');
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color.startsWith('#') ? color : `#${color}`)
      .setTimestamp()
      .setFooter({ text: footer || 'MythosCore' });

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Embed sent to ${channel}!`, ephemeral: true });
  },
};
