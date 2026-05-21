const { InteractionType } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const { cooldowns } = client;
      if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Map());
      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expiry = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expiry) {
          const remaining = ((expiry - now) / 1000).toFixed(1);
          return interaction.reply({
            content: `⏳ Please wait **${remaining}s** before using \`/${command.data.name}\` again.`,
            ephemeral: true,
          });
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction, client);
      } catch (error) {
        logger.error(`Command ${interaction.commandName} failed:`, error);
        const msg = { content: '❌ An error occurred while executing this command.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
    }

    if (interaction.isButton()) {
      const [action, ...args] = interaction.customId.split(':');
      const handler = require('../button-handlers/' + action).catch?.(() => null)
        || client.buttonHandlers?.get(action);
      if (handler) {
        try { await handler(interaction, args, client); } catch {}
      }
    }
  },
};
