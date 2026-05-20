const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }

  console.log(`[MythosCore] Loaded ${client.commands.size} commands.`);
  registerSlashCommands(client);
}

async function registerSlashCommands(client) {
  const commands = client.commands.map(cmd => cmd.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('[MythosCore] Slash commands registered globally.');
  } catch (err) {
    console.error('[MythosCore] Failed to register slash commands:', err);
  }
}

module.exports = { loadCommands };
