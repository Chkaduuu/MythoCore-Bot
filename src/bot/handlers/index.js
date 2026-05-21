const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories = fs.readdirSync(commandsPath);

  let loaded = 0;
  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const command = require(path.join(categoryPath, file));
        if (command?.data && command?.execute) {
          client.commands.set(command.data.name, command);
          loaded++;
        }
      } catch (e) {
        logger.error(`Failed to load command ${file}: ${e.message}`);
      }
    }
  }
  logger.info(`✅ Loaded ${loaded} commands`);
}

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  let loaded = 0;
  for (const file of files) {
    try {
      const event = require(path.join(eventsPath, file));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      loaded++;
    } catch (e) {
      logger.error(`Failed to load event ${file}: ${e.message}`);
    }
  }
  logger.info(`✅ Loaded ${loaded} events`);
}

module.exports = { loadCommands, loadEvents };
