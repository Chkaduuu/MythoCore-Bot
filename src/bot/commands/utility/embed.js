const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create and send a custom embed message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId('embed_builder').setTitle('Embed Builder');
    const titleInput = new TextInputBuilder().setCustomId('embed_title').setLabel('Title').setStyle(TextInputStyle.Short).setRequired(false);
    const descInput = new TextInputBuilder().setCustomId('embed_desc').setLabel('Description').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const colorInput = new TextInputBuilder().setCustomId('embed_color').setLabel('Color (hex)').setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('#5865F2');
    const footerInput = new TextInputBuilder().setCustomId('embed_footer').setLabel('Footer text').setStyle(TextInputStyle.Short).setRequired(false);
    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descInput),
      new ActionRowBuilder().addComponents(colorInput),
      new ActionRowBuilder().addComponents(footerInput),
    );
    await interaction.showModal(modal);
    const submitted = await interaction.awaitModalSubmit({ time: 300000 }).catch(() => null);
    if (!submitted) return;
    const title = submitted.fields.getTextInputValue('embed_title');
    const desc = submitted.fields.getTextInputValue('embed_desc');
    const color = submitted.fields.getTextInputValue('embed_color') || '#5865F2';
    const footer = submitted.fields.getTextInputValue('embed_footer');
    const embed = new EmbedBuilder().setColor(color).setDescription(desc);
    if (title) embed.setTitle(title);
    if (footer) embed.setFooter({ text: footer });
    await submitted.reply({ content: '✅ Embed sent!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed] });
  },
};
