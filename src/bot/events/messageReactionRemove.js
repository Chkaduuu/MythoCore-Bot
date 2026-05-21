const db = require('../../database');
module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user, client) {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch().catch(() => {});
    const guild = reaction.message.guild;
    if (!guild) return;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
    const rr = db.get().get('SELECT * FROM reaction_roles WHERE message_id = ? AND (emoji = ? OR emoji = ?)', [reaction.message.id, emoji, reaction.emoji.name]);
    if (!rr || rr.type === 'verify') return;
    const role = guild.roles.cache.get(rr.role_id);
    if (role) await member.roles.remove(role).catch(() => {});
  },
};
