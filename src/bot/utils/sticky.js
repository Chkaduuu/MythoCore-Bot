const db = require('../../database');

async function checkStickyMessages(message, client) {
  const sticky = db.get().get('SELECT * FROM sticky_messages WHERE channel_id = ? AND guild_id = ?', [message.channel.id, message.guild.id]);
  if (!sticky) return;

  try {
    if (sticky.last_message_id) {
      const old = await message.channel.messages.fetch(sticky.last_message_id).catch(() => null);
      if (old) await old.delete().catch(() => {});
    }
    const sent = await message.channel.send({ content: sticky.content });
    db.get().run('UPDATE sticky_messages SET last_message_id = ? WHERE channel_id = ?', [sent.id, message.channel.id]);
  } catch {}
}

module.exports = { checkStickyMessages };
