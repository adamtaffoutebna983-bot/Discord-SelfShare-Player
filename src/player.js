const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const { Client } = require("discord.js-selfbot-v13");
const { Streamer, prepareStream, playStream } = require("@dank074/discord-video-stream");
const ffmpeg = require("fluent-ffmpeg");
const youtubedl = require("youtube-dl-exec");
const log = require("./logger");

try {
  let hasSystemFfmpeg = false;
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    hasSystemFfmpeg = true;
  } catch {}

  if (!hasSystemFfmpeg) {
    const ffmpegStatic = require("ffmpeg-static");
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
      process.env.FFMPEG_PATH = ffmpegStatic;
    }
  }
} catch {}

function isDirectMedia(url) {
  return /\.(mp4|mkv|webm|mov|m4v|m3u8)(\?.*)?$/i.test(url);
}

class VideoPlayer {
  constructor(config) {
    this.config = config;
    this.client = new Client({ checkUpdate: false });
    this.streamer = new Streamer(this.client);

    this.streaming = false;
    this.abortCtrl = null;
    this.cleanupProc = null;

    this.guildId = null;
    this.channelId = null;
  }

  async join(guildId, channelId) {
    if (this.channelId === channelId) return;

    if (this.channelId) {
      await this.stop();
      try {
        this.streamer.leaveVoice();
      } catch {}
    }

    log.info(`joining voice channel ${channelId}`);
    await this.streamer.joinVoice(guildId, channelId);
    this.guildId = guildId;
    this.channelId = channelId;
  }

  async play(videoSource, streamType = this.config.streamType) {
    if (this.streaming) {
      throw new Error("وقف الأول بعدين شغل الثاني ياحب");
    }

    let input = videoSource;
    let cleanup = () => {};

    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      input = path.resolve(input);
      if (!fs.existsSync(input)) {
        throw new Error(`الملف غير موجود: ${input}`);
      }
    } else if (!isDirectMedia(input)) {
      log.info(`resolving stream via youtube-dl-exec: ${input}`);
      const ytdlOpts = {
        format: "bestvideo[vcodec^=avc1][height<=720]+bestaudio[acodec^=mp4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best",
        output: "-",
        extractorArgs: "youtube:player_client=android",
      };

      const cookiesPath = path.resolve("cookies.txt");
      if (fs.existsSync(cookiesPath)) {
        ytdlOpts.cookies = cookiesPath;
      }

      const proc = youtubedl.exec(input, ytdlOpts);
      proc.catch((err) => {
        if (!this.abortCtrl?.signal.aborted) {
          log.error(`yt-dlp error: ${err.message}`);
        }
      });

      input = proc.stdout;
      cleanup = () => {
        try {
          if (!proc.killed) proc.kill();
        } catch {}
      };
    }

    this.streaming = true;
    this.abortCtrl = new AbortController();
    this.cleanupProc = cleanup;

    try {
      log.stream(`starting stream (${streamType}): ${videoSource}`);

      const { output, command, promise: ffmpegPromise } = prepareStream(
        input,
        {
          width: this.config.width,
          height: this.config.height,
          frameRate: this.config.fps,
          bitrateVideo: this.config.bitrate,
          bitrateVideoMax: Math.round(this.config.bitrate * 1.4),
          bitrateAudio: 128,
          includeAudio: true,
          hardwareAcceleratedDecoding: false,
          minimizeLatency: false,
          noTranscoding: false,
          videoCodec: "H264",
        },
        this.abortCtrl.signal
      );

      command.on("error", (err) => {
        if (!this.abortCtrl?.signal.aborted) {
          log.error(`ffmpeg: ${err.message}`);
        }
      });

      await playStream(
        output,
        this.streamer,
        {
          type: streamType,
          width: this.config.width,
          height: this.config.height,
          frameRate: this.config.fps,
        },
        this.abortCtrl.signal
      );

      await ffmpegPromise.catch(() => {});
      log.info("playback finished");
    } catch (err) {
      if (this.streaming) throw err;
    } finally {
      this.streaming = false;
      if (this.cleanupProc) {
        this.cleanupProc();
        this.cleanupProc = null;
      }
    }
  }

  async stop() {
    if (!this.streaming && !this.cleanupProc) return;

    this.streaming = false;

    if (this.cleanupProc) {
      this.cleanupProc();
      this.cleanupProc = null;
    }

    if (this.abortCtrl) {
      this.abortCtrl.abort();
      this.abortCtrl = null;
    }

    try {
      this.streamer.stopStream();
    } catch {}

    log.info("stream stopped");
  }

  async leave() {
    await this.stop();
    try {
      this.streamer.leaveVoice();
    } catch {}
    this.guildId = null;
    this.channelId = null;
  }

  async destroy() {
    await this.leave();
    try {
      this.client.destroy();
    } catch {}
  }
}

module.exports = { VideoPlayer };
