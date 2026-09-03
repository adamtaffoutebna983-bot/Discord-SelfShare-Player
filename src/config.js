require("dotenv").config();

if (!process.env.DISCORD_TOKEN) {
  console.error("[config] missing DISCORD_TOKEN in .env");
  process.exit(1);
}

const token = process.env.DISCORD_TOKEN.trim().replace(/^["']|["']$/g, "");

const allowedIds = (process.env.ALLOWED_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (allowedIds.length === 0) {
  console.warn("[config] warning: ALLOWED_IDS is empty, nobody will be able to run commands");
}

module.exports = {
  token,
  prefix: (process.env.PREFIX || "!").trim(),
  allowedIds,
  streamType: process.env.STREAM_TYPE === "camera" ? "camera" : "go-live",
  width: parseInt(process.env.VIDEO_WIDTH, 10) || 1280,
  height: parseInt(process.env.VIDEO_HEIGHT, 10) || 720,
  fps: parseInt(process.env.FRAME_RATE, 10) || 30,
  bitrate: parseInt(process.env.VIDEO_BITRATE, 10) || 5000,
};
