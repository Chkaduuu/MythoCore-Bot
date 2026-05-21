const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song in voice channel')
    .addStringOption(o => o.setName('query').setDescription('Song name or URL').setRequired(true)),
  async execute(interaction, client) {
    const member = interaction.member;
    if (!member.voice.channel) return interaction.reply({ content: '❌ Join a voice channel first!', ephemeral: true });
    await interaction.deferReply();

    const query = interaction.options.getString('query');
    let queue = client.musicQueues.get(interaction.guild.id);

    try {
      let source;
      if (play.yt_validate(query) === 'video') {
        const info = await play.video_info(query);
        source = { title: info.video_details.title, url: query, duration: info.video_details.durationRaw, thumbnail: info.video_details.thumbnails[0]?.url };
      } else {
        const results = await play.search(query, { source: { youtube: 'video' }, limit: 1 });
        if (!results.length) return interaction.editReply({ content: '❌ No results found.' });
        const info = results[0];
        source = { title: info.title, url: info.url, duration: info.durationRaw, thumbnail: info.thumbnails[0]?.url };
      }

      if (!queue) {
        const connection = joinVoiceChannel({
          channelId: member.voice.channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        queue = { connection, player, songs: [], volume: 50, loop: false };
        client.musicQueues.set(interaction.guild.id, queue);

        player.on(AudioPlayerStatus.Idle, async () => {
          const q = client.musicQueues.get(interaction.guild.id);
          if (!q) return;
          if (q.loop && q.songs.length) { q.songs.push(q.songs[0]); }
          q.songs.shift();
          if (q.songs.length) await playSong(q, q.songs[0]);
          else { setTimeout(() => { q.connection.destroy(); client.musicQueues.delete(interaction.guild.id); }, 30000); }
        });

        connection.subscribe(player);
      }

      queue.songs.push(source);
      if (queue.songs.length === 1) await playSong(queue, source);

      const embed = new EmbedBuilder().setColor('#1DB954').setTitle(queue.songs.length > 1 ? '📋 Added to Queue' : '🎵 Now Playing')
        .setDescription(`[${source.title}](${source.url})`)
        .addFields({ name: 'Duration', value: source.duration || 'Unknown', inline: true })
        .setThumbnail(source.thumbnail);
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ content: `❌ Error: ${e.message}` });
    }
  },
};

async function playSong(queue, song) {
  const stream = await play.stream(song.url);
  const resource = createAudioResource(stream.stream, { inputType: stream.type });
  queue.player.play(resource);
}
