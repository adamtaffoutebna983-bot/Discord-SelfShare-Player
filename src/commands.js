const log = require("./logger");

function registerCommands(client, player, config) {
  const { prefix, allowedIds } = config;

  client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith(prefix)) return;
    if (allowedIds.length > 0 && !allowedIds.includes(msg.author.id)) return;

    const args = msg.content.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();

    try {
      const playCmds = ["play", "p", "شغل", "بث"];
      const liveCmds = ["live", "لايف", "شاشة"];
      const camCmds = ["cam", "camera", "كام", "كاميرا"];
      const stopCmds = ["stop", "pause", "وقف", "ايقاف", "توقف"];
      const leaveCmds = ["leave", "dc", "اخرج", "غادر", "طلع"];
      const helpCmds = ["help", "مساعدة", "اوامر", "أوامر"];

      if (playCmds.includes(cmd) || liveCmds.includes(cmd) || camCmds.includes(cmd)) {
        let url = args.join(" ").trim().replace(/^<|>$/g, "");

        if (!url) {
          return msg.reply(`اكتب الرابط: \`${prefix}${cmd} <رابط>\``);
        }

        const voice = msg.member?.voice?.channel;
        if (!voice) {
          return msg.reply("أدخل فويس عشان تقدر تستعمل الأمر");
        }

        const mode = camCmds.includes(cmd) ? "camera" : (liveCmds.includes(cmd) ? "go-live" : player.config.streamType);
        const status = await msg.reply(`يتم يتم [${mode === "camera" ? "كاميرا" : "شاشة"}]`);

        await player.join(voice.guild.id, voice.id);
        await new Promise((r) => setTimeout(r, 600));

        player.play(url, mode).catch((err) => {
          log.error(`playback error: ${err.message}`);
          msg.channel.send(`خطأ: ${err.message}`).catch(() => {});
        });

        status.edit(`تم التشغيل [${mode === "camera" ? "كاميرا" : "شاشة"}]: ${url}`).catch(() => {});
        return;
      }

      if (stopCmds.includes(cmd)) {
        if (!player.streaming) {
          return msg.reply("مافي فيديو شغال حاليا");
        }
        await player.stop();
        return msg.reply("تم الإيقاف.");
      }

      if (leaveCmds.includes(cmd)) {
        if (!player.channelId) {
          return msg.reply("انا مب داخل فويس أصلاً");
        }
        await player.leave();
        return msg.reply("تم");
      }

      if (helpCmds.includes(cmd)) {
        return msg.reply(
          [
            `\`${prefix}cam <رابط>\` أو \`${prefix}كام\` - بث كاميرا (صوت مباشر)`,
            `\`${prefix}play <رابط>\` أو \`${prefix}شغل\` - بث شاشة`,
            `\`${prefix}stop\` أو \`${prefix}وقف\` - إيقاف`,
            `\`${prefix}leave\` أو \`${prefix}اخرج\` - خروج`,
          ].join("\n")
        );
      }
    } catch (err) {
      log.error(`command error: ${err.message}`);
      msg.reply(`خطأ: ${err.message}`).catch(() => {});
    }
  });

  log.success(`commands loaded (prefix: "${prefix}")`);
}

module.exports = { registerCommands };
