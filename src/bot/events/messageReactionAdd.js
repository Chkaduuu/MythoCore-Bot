const db = require('../../database');
module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user, client) {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch().catch(() => {});
    if (reaction.message.partial) await reaction.message.fetch().catch(() => {});
    const guild = reaction.message.guild;
    if (!guild) return;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
    const rr = db.get().get('SELECT * FROM reaction_roles WHERE message_id = ? AND (emoji = ? OR emoji = ?)', [reaction.message.id, emoji, reaction.emoji.name]);
    if (!rr) return;
    const role = guild.roles.cache.get(rr.role_id);
    if (!role) return;
    if (rr.type === 'unique') {
      const others = db.get().query('SELECT * FROM reaction_roles WHERE message_id = ? AND role_id != ?', [reaction.message.id, rr.role_id]);
      for (const other of others) {
        if (member.roles.cache.has(other.role_id)) await member.roles.remove(other.role_id).catch(() => {});
      }
    }
    await member.roles.add(role).catch(() => {});
  },
};
