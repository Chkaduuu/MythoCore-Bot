const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure auto moderation')
    .addSubcommand(s => s.setName('setup').setDescription('Enable/disable automod features')
      .addStringOption(o => o.setName('feature').setDescription('Feature to toggle').setRequired(true).addChoices(
        { name: 'Anti Spam', value: 'anti_spam' },
        { name: 'Anti Links', value: 'anti_links' },
        { name: 'Anti Invites', value: 'anti_invites' },
        { name: 'Anti Caps', value: 'anti_caps' },
        { name: 'Anti Mass Mention', value: 'anti_mentions' }
      ))
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .addSubcommand(s => s.setName('action').setDescription('Set punishment action')
      .addStringOption(o => o.setName('action').setDescription('Action').setRequired(true).addChoices(
        { name: 'Warn', value: 'warn' }, { name: 'Mute', value: 'mute' }, { name: 'Kick', value: 'kick' }, { name: 'Ban', value: 'ban' }
      )))
    .addSubcommand(s => s.setName('addword').setDescription('Add banned word').addStringOption(o => o.setName('word').setDescription('Word').setRequired(true)))
    .addSubcommand(s => s.setName('status').setDescription('View automod settings'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    db.get().run('INSERT OR IGNORE INTO automod_config (guild_id) VALUES (?)', [interaction.guild.id]);

    if (sub === 'setup') {
      const feature = interaction.options.getString('feature');
      const enabled = interaction.options.getBoolean('enabled') ? 1 : 0;
      db.get().run(`UPDATE automod_config SET ${feature} = ? WHERE guild_id = ?`, [enabled, interaction.guild.id]);
      await interaction.reply({ content: `✅ **${feature.replace(/_/g, ' ')}** is now **${enabled ? 'enabled' : 'disabled'}**.`, ephemeral: true });
    } else if (sub === 'action') {
      const action = interaction.options.getString('action');
      db.get().run('UPDATE automod_config SET action = ? WHERE guild_id = ?', [action, interaction.guild.id]);
      await interaction.reply({ content: `✅ AutoMod punishment set to **${action}**.`, ephemeral: true });
    } else if (sub === 'addword') {
      const word = interaction.options.getString('word');
      const config = db.get().get('SELECT banned_words FROM automod_config WHERE guild_id = ?', [interaction.guild.id]);
      const words = JSON.parse(config?.banned_words || '[]');
      words.push(word.toLowerCase());
      db.get().run('UPDATE automod_config SET banned_words = ? WHERE guild_id = ?', [JSON.stringify(words), interaction.guild.id]);
      await interaction.reply({ content: `✅ Added **${word}** to banned words.`, ephemeral: true });
    } else {
      const config = db.get().get('SELECT * FROM automod_config WHERE guild_id = ?', [interaction.guild.id]);
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🤖 AutoMod Settings')
        .addFields(
          { name: 'Anti Spam', value: config?.anti_spam ? '✅' : '❌', inline: true },
          { name: 'Anti Links', value: config?.anti_links ? '✅' : '❌', inline: true },
          { name: 'Anti Invites', value: config?.anti_invites ? '✅' : '❌', inline: true },
          { name: 'Anti Caps', value: config?.anti_caps ? '✅' : '❌', inline: true },
          { name: 'Anti Mentions', value: config?.anti_mentions ? '✅' : '❌', inline: true },
          { name: 'Punishment', value: config?.action || 'warn', inline: true },
          { name: 'Banned Words', value: `${JSON.parse(config?.banned_words || '[]').length} words` }
        );
      await interaction.reply({ embeds: [embed] });
    }
  },
};
