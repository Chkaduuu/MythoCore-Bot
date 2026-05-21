const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('userinfo').setDescription('View information about a user')
    .addUserOption(o => o.setName('user').setDescription('User to check')),
  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.member;
    const badges = target.user.flags?.toArray().map(f => f.replace(/_/g, ' ')).join(', ') || 'None';
    const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`👤 ${target.user.tag}`)
      .setThumbnail(target.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: target.id, inline: true },
        { name: 'Nickname', value: target.nickname || 'None', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: `Roles (${target.roles.cache.size - 1})`, value: target.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => r.toString()).slice(0, 10).join(', ') || 'None' },
        { name: 'Badges', value: badges, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
