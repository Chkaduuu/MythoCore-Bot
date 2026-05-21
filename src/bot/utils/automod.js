const db = require('../../database');

const spamMap = new Map();

async function checkAutoMod(message, client) {
  const config = db.get().get('SELECT * FROM automod_config WHERE guild_id = ?', [message.guild.id]);
  if (!config) return;

  const whitelistedChannels = JSON.parse(config.whitelisted_channels || '[]');
  const whitelistedRoles = JSON.parse(config.whitelisted_roles || '[]');

  if (whitelistedChannels.includes(message.channel.id)) return;
  if (message.member?.roles.cache.some(r => whitelistedRoles.includes(r.id))) return;

  let violated = false;
  let reason = '';

  // Anti Spam
  if (config.anti_spam) {
    const key = `${message.author.id}-${message.guild.id}`;
    const now = Date.now();
    const userMsgs = spamMap.get(key) || [];
    const recent = userMsgs.filter(t => now - t < config.spam_interval * 1000);
    recent.push(now);
    spamMap.set(key, recent);
    if (recent.length > config.max_messages) {
      violated = true; reason = 'Spam detected';
    }
  }

  // Anti Links
  if (!violated && config.anti_links) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    if (urlRegex.test(message.content)) { violated = true; reason = 'Links not allowed'; }
  }

  // Anti Discord Invites
  if (!violated && config.anti_invites) {
    const inviteRegex = /discord\.gg\/[a-zA-Z0-9]+/gi;
    if (inviteRegex.test(message.content)) { violated = true; reason = 'Discord invites not allowed'; }
  }

  // Anti Caps (>70% caps)
  if (!violated && config.anti_caps && message.content.length > 10) {
    const caps = message.content.replace(/[^A-Z]/g, '').length;
    if (caps / message.content.length > 0.7) { violated = true; reason = 'Excessive caps'; }
  }

  // Anti Mass Mention
  if (!violated && config.anti_mentions) {
    if (message.mentions.users.size + message.mentions.roles.size > config.max_mentions) {
      violated = true; reason = 'Too many mentions';
    }
  }

  // Banned words
  if (!violated) {
    const banned = JSON.parse(config.banned_words || '[]');
    for (const word of banned) {
      if (message.content.toLowerCase().includes(word.toLowerCase())) {
        violated = true; reason = `Banned word: ${word}`; break;
      }
    }
  }

  if (!violated) return;

  try { await message.delete(); } catch {}

  if (config.action === 'warn') {
    const warn = await message.channel.send(`⚠️ ${message.author}, **${reason}**`);
    setTimeout(() => warn.delete().catch(() => {}), 5000);
  } else if (config.action === 'mute') {
    const role = message.guild.roles.cache.find(r => r.name === 'Muted');
    if (role) await message.member.roles.add(role).catch(() => {});
    setTimeout(async () => {
      if (role) await message.member.roles.remove(role).catch(() => {});
    }, 10 * 60 * 1000);
  } else if (config.action === 'kick') {
    await message.member.kick(reason).catch(() => {});
  }
}

module.exports = { checkAutoMod };
