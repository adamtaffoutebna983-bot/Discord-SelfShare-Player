require("../scripts/patch-streamer");
const config = require("./config");
const { VideoPlayer } = require("./player");
const { registerCommands } = require("./commands");
const { ensureBinary } = require("./ensureBinary");
const log = require("./logger");

async function init() {
  await ensureBinary();

  const player = new VideoPlayer(config);

  let initialized = false;
  const onReady = () => {
    if (initialized) return;
    initialized = true;
    log.success(`logged in as ${player.client.user?.tag || player.client.user?.username}`);
    registerCommands(player.client, player, config);
  };

  player.client.once("ready", onReady);

  player.client.on("shardReady", (id) => {
    log.info(`gateway shard ${id} connected, syncing account...`);
  });

  player.client.on("error", (err) => {
    log.error(`client error: ${err.message}`);
  });

  log.info("logging in to discord...");
  await player.client.login(config.token);

  if (player.client.isReady?.() || player.client.readyAt) {
    onReady();
  }

  const shutdown = async () => {
    log.warn("shutting down...");
    await player.destroy();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

init().catch((err) => {
  log.error(`startup error: ${err.message}`);
  process.exit(1);
});
