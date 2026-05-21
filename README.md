# 🤖 Discord Bot — Full Featured

A feature-rich Discord bot with web dashboard. Built with **Discord.js v14** and **Express**.

## ✨ Features

| Category | Features |
|----------|----------|
| 🔨 **Moderation** | Ban, Kick, Warn, Timeout, Purge, Case History |
| 💰 **Economy** | Balance, Daily, Work, Pay, Shop, Leaderboard |
| ⭐ **Leveling** | XP System, Custom Rank Cards, Role Rewards |
| 🎵 **Music** | YouTube Streaming, Queue, Loop, Skip, Stop |
| 🎉 **Giveaways** | Interactive Setup, Instant Giveaways, Reroll |
| 🤖 **AutoMod** | Anti-Spam, Anti-Links, Anti-Invites, Anti-Caps |
| 👋 **Welcomer** | Custom Images & Messages, DM Welcome |
| 🎭 **Reaction Roles** | Normal, Unique, Verify Types |
| 🔊 **Temp Voice** | User-managed Voice Channels |
| 📋 **Applications** | Custom Form Builder with Modal UI |
| 📨 **Invite Tracking** | Track Who Invites Who |
| 💡 **Suggestions** | Upvote/Downvote with Buttons |
| 📝 **Logging** | Mod, Member, Message, Voice Events |
| 📌 **Sticky Messages** | Auto-repost Messages |
| 🎭 **Auto Roles** | Assign Roles on Join |
| 🌐 **Dashboard** | Web UI for Configuration |

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd discord-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DISCORD_TOKEN` — Your bot token from [Discord Developer Portal](https://discord.com/developers/applications)
- `CLIENT_ID` — Your application's Client ID
- `CLIENT_SECRET` — Your application's Client Secret (for dashboard OAuth)
- `GUILD_ID` — Your server ID (for instant slash command deployment during dev)

### 4. Deploy Slash Commands

```bash
npm run deploy
```

### 5. Start the Bot

```bash
npm start
```

### 6. Start the Dashboard (optional)

```bash
npm run dashboard
```

Open http://localhost:3000

---

## 🔄 24/7 Hosting Options

### Option A: Railway.app (Recommended — Free Tier Available)

1. Go to [railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub Repo**
3. Select your repository
4. Add Environment Variables in Railway dashboard (same as `.env`)
5. Set **Start Command** to `npm start`
6. Railway auto-deploys on every push to `main` ✅

### Option B: Render.com (Free Tier)

1. Go to [render.com](https://render.com)
2. Create a **Web Service** from your GitHub repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables

### Option C: GitHub Codespaces

1. Open repository on GitHub
2. Click **Code → Codespaces → Create codespace**
3. Run `cp .env.example .env` and fill in tokens
4. Run `npm start`
5. **Note:** Codespaces pause after inactivity — use Railway for true 24/7

---

## 📁 Project Structure

```
discord-bot/
├── .devcontainer/          # GitHub Codespaces config
├── .github/workflows/      # GitHub Actions (CI/deploy)
├── src/
│   ├── bot/
│   │   ├── commands/       # Slash commands by category
│   │   │   ├── moderation/
│   │   │   ├── economy/
│   │   │   ├── leveling/
│   │   │   ├── music/
│   │   │   ├── fun/
│   │   │   ├── giveaway/
│   │   │   ├── utility/
│   │   │   ├── automod/
│   │   │   ├── welcomer/
│   │   │   ├── reactionroles/
│   │   │   ├── suggestions/
│   │   │   ├── applications/
│   │   │   ├── invites/
│   │   │   ├── logging/
│   │   │   └── tempvc/
│   │   ├── events/         # Discord.js event handlers
│   │   ├── handlers/       # Command & event loader
│   │   ├── utils/          # Helpers (leveling, automod, etc.)
│   │   ├── index.js        # Bot entry point
│   │   └── deploy-commands.js
│   ├── dashboard/
│   │   ├── server.js       # Express + Passport OAuth2
│   │   ├── routes/         # API & page routes
│   │   ├── views/          # EJS templates
│   │   └── public/         # CSS & JS assets
│   ├── database/
│   │   ├── index.js        # DB abstraction layer
│   │   └── providers/      # SQLite / MySQL / MongoDB
│   └── utils/
│       └── logger.js       # Winston logger
├── .env.example
├── .gitignore
└── package.json
```

## 🗄️ Database Support

Set `DB_TYPE` in `.env`:

| Value | Database | Notes |
|-------|----------|-------|
| `sqlite` | SQLite (default) | No setup needed, file-based |
| `mysql` | MySQL / MariaDB | Set `MYSQL_*` vars |
| `mongodb` | MongoDB | Set `MONGODB_URI` |

## 📋 Commands Reference

### Moderation
| Command | Description |
|---------|-------------|
| `/ban @user [reason] [days]` | Ban a member |
| `/kick @user [reason]` | Kick a member |
| `/warn @user <reason>` | Warn a member |
| `/warnings @user` | View user warnings |
| `/timeout @user <minutes> [reason]` | Timeout a member |
| `/purge <amount> [@user]` | Bulk delete messages |

### Economy
| Command | Description |
|---------|-------------|
| `/balance [@user]` | Check balance |
| `/daily` | Claim daily reward |
| `/work` | Earn coins |
| `/pay @user <amount>` | Transfer coins |
| `/leaderboard economy` | Economy leaderboard |

### Leveling
| Command | Description |
|---------|-------------|
| `/rank [@user]` | View rank card |
| `/setrank` | Customize rank card colors |
| `/setlevelrole <role> <level>` | Set level role reward |
| `/leaderboard levels` | Level leaderboard |

### Music
| Command | Description |
|---------|-------------|
| `/play <query>` | Play a song |
| `/skip` | Skip current song |
| `/stop` | Stop music |
| `/queue` | View queue |
| `/loop` | Toggle loop |

### Giveaways
| Command | Description |
|---------|-------------|
| `/giveaway start <duration> <prize>` | Start giveaway |
| `/giveaway end <message_id>` | End early |
| `/giveaway reroll <message_id>` | Reroll winners |
| `/giveaway list` | Active giveaways |

### Configuration
| Command | Description |
|---------|-------------|
| `/automod setup <feature> <true/false>` | Toggle automod |
| `/setwelcome channel #channel` | Set welcome channel |
| `/setlog <type> #channel` | Configure logging |
| `/reactionrole add` | Add reaction role |
| `/tempvc setup <category>` | Setup temp voice |
| `/autorole add <role>` | Add auto role |
| `/sticky set <message>` | Set sticky message |

## 🛡️ Required Bot Permissions

When inviting your bot, use these permissions:
- Administrator (recommended for full functionality)

Or manually: `BanMembers`, `KickMembers`, `ManageRoles`, `ManageChannels`, `ManageMessages`, `ReadMessageHistory`, `SendMessages`, `EmbedLinks`, `AttachFiles`, `UseExternalEmojis`, `AddReactions`, `Connect`, `Speak`, `MoveMembers`, `ModerateMembers`

## 🔗 Invite URL Template

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot+applications.commands&permissions=8
```

Replace `YOUR_CLIENT_ID` with your bot's client ID.

---

Built with ❤️ using Discord.js v14
