const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('application')
    .setDescription('Application system')
    .addSubcommand(s => s.setName('create').setDescription('Create an application form')
      .addStringOption(o => o.setName('name').setDescription('Application name').setRequired(true))
      .addChannelOption(o => o.setName('log').setDescription('Where to send responses').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List applications'))
    .addSubcommand(s => s.setName('apply').setDescription('Apply for a position')
      .addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true)))
    .addSubcommand(s => s.setName('toggle').setDescription('Toggle application active state')
      .addIntegerOption(o => o.setName('id').setDescription('Application ID').setRequired(true))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Missing permissions.', ephemeral: true });
      const name = interaction.options.getString('name');
      const log = interaction.options.getChannel('log');
      const defaultQuestions = ['Why do you want to join?', 'Tell us about yourself.', 'How old are you?', 'What is your timezone?'];
      const result = db.get().run('INSERT INTO applications (guild_id, name, questions, log_channel_id) VALUES (?, ?, ?, ?)',
        [interaction.guild.id, name, JSON.stringify(defaultQuestions), log.id]);
      await interaction.reply({ content: `✅ Application **${name}** created with ID **${result.lastInsertRowid}**.`, ephemeral: true });
    }

    if (sub === 'list') {
      const apps = db.get().query('SELECT * FROM applications WHERE guild_id = ?', [interaction.guild.id]);
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('📋 Applications')
        .setDescription(apps.length ? apps.map(a => `**${a.id}.** ${a.name} — ${a.active ? '✅ Active' : '❌ Inactive'}`).join('\n') : 'No applications created.');
      await interaction.reply({ embeds: [embed] });
    }

    if (sub === 'apply') {
      const id = interaction.options.getInteger('id');
      const app = db.get().get('SELECT * FROM applications WHERE id = ? AND guild_id = ?', [id, interaction.guild.id]);
      if (!app || !app.active) return interaction.reply({ content: '❌ Application not found or inactive.', ephemeral: true });
      const questions = JSON.parse(app.questions);

      const modal = new ModalBuilder().setCustomId(`apply:${id}`).setTitle(app.name);
      for (let i = 0; i < Math.min(questions.length, 5); i++) {
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId(`q${i}`).setLabel(questions[i]).setStyle(TextInputStyle.Paragraph).setRequired(true)
        ));
      }
      await interaction.showModal(modal);

      const submitted = await interaction.awaitModalSubmit({ time: 600000 }).catch(() => null);
      if (!submitted) return;

      const answers = questions.slice(0, 5).map((q, i) => ({ q, a: submitted.fields.getTextInputValue(`q${i}`) }));
      db.get().run('INSERT INTO application_responses (application_id, user_id, guild_id, answers) VALUES (?, ?, ?, ?)',
        [id, interaction.user.id, interaction.guild.id, JSON.stringify(answers)]);

      const logChannel = interaction.guild.channels.cache.get(app.log_channel_id);
      if (logChannel) {
        const embed = new EmbedBuilder().setColor('#5865F2').setTitle(`📋 New Application: ${app.name}`)
          .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
          .addFields(answers.map(({ q, a }) => ({ name: q, value: a.slice(0, 1024) })))
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }
      await submitted.reply({ content: '✅ Your application has been submitted!', ephemeral: true });
    }

    if (sub === 'toggle') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: '❌ Missing permissions.', ephemeral: true });
      const id = interaction.options.getInteger('id');
      const app = db.get().get('SELECT active FROM applications WHERE id = ? AND guild_id = ?', [id, interaction.guild.id]);
      if (!app) return interaction.reply({ content: '❌ Application not found.', ephemeral: true });
      db.get().run('UPDATE applications SET active = ? WHERE id = ?', [app.active ? 0 : 1, id]);
      await interaction.reply({ content: `✅ Application ${app.active ? 'disabled' : 'enabled'}.`, ephemeral: true });
    }
  },
};
