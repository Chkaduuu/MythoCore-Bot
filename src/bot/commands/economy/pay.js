const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transfer coins to another user')
    .addUserOption(o => o.setName('user').setDescription('User to pay').setRequired(true))
    .addIntegerOption(o => o.setName('amount').setDescription('Amount to transfer').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ You cannot pay yourself.', ephemeral: true });
    const sender = db.get().get('SELECT * FROM users WHERE id = ? AND guild_id = ?', [interaction.user.id, interaction.guild.id]);
    if (!sender || sender.balance < amount) return interaction.reply({ content: '❌ Insufficient funds.', ephemeral: true });
    db.get().run('UPDATE users SET balance = balance - ? WHERE id = ? AND guild_id = ?', [amount, interaction.user.id, interaction.guild.id]);
    db.get().run('INSERT OR IGNORE INTO users (id, guild_id) VALUES (?, ?)', [target.id, interaction.guild.id]);
    db.get().run('UPDATE users SET balance = balance + ? WHERE id = ? AND guild_id = ?', [amount, target.id, interaction.guild.id]);
    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('💸 Transfer Complete')
      .setDescription(`Successfully sent **${amount.toLocaleString()} coins** to ${target}`).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
