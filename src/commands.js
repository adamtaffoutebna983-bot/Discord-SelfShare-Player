const log = require("./logger");
function registerCommands(client, player, config) {
  const { prefix, allowedIds } = config;
  client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith(prefix)) return;
    if (allowedIds.length > 0 && !allowedIds.includes(msg.author.id)) return;
    const args = msg.content.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();
    try {
      const playCmds = ["play", "p"];
      const liveCmds = ["live"];
      const camCmds = ["cam", "camera"];
      const stopCmds = ["stop", "pause"];
      const leaveCmds = ["leave", "dc"];
      const helpCmds = ["help", "commands"];
      if (playCmds.includes(cmd) || liveCmds.includes(cmd) || camCmds.includes(cmd)) {
        let url = args.join(" ").trim().replace(/^<|>$/g, "");
        if (!url) {
          return msg.reply(`Enter a link: \`${prefix}${cmd} <url>\``);
        }
        const voice = msg.member?.voice?.channel;
        if (!voice) {
          return msg.reply("Join a voice channel to use this command");
        }
        const mode = camCmds.includes(cmd) ? "camera" : (liveCmds.includes(cmd) ? "go-live" : player.config.streamType);
        const status = await msg.reply(`Starting [${mode === "camera" ? "Camera" : "Screen Share"}]`);
        await player.join(voice.guild.id, voice.id);
        await new Promise((r) => setTimeout(r, 600));
        player.play(url, mode).catch((err) => {
          log.error(`playback error: ${err.message}`);
          msg.channel.send(`Error: ${err.message}`).catch(() => {});
        });
        status.edit(`Now playing [${mode === "camera" ? "Camera" : "Screen Share"}]: ${url}`).catch(() => {});
        return;
      }
      if (stopCmds.includes(cmd)) {
        if (!player.streaming) {
          return msg.reply("No video is currently playing");
        }
        await player.stop();
        return msg.reply("Stopped.");
      }
      if (leaveCmds.includes(cmd)) {
        if (!player.channelId) {
          return msg.reply("I'm not in a voice channel");
        }
        await player.leave();
        return msg.reply("Done");
      }
      if (helpCmds.includes(cmd)) {
        return msg.reply(
          [
            `\`${prefix}cam <url>\` - camera stream (mic audio)`,
            `\`${prefix}play <url>\` - screen share stream`,
            `\`${prefix}stop\` - stop playback`,
            `\`${prefix}leave\` - disconnect`,
          ].join("\n")
        );
      }
    } catch (err) {
      log.error(`command error: ${err.message}`);
      msg.reply(`Error: ${err.message}`).catch(() => {});
    }
  });
  log.success(`commands loaded (prefix: "${prefix}")`);
}
module.exports = { registerCommands };
