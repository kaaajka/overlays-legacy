import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
const folder = ".motion-qa/studio-2.1";
mkdirSync(folder, { recursive: true });
const url = process.argv[2] ?? "http://127.0.0.1:5173";
const assets = Array.from({ length: 7 }, (_, index) => {
  const data = JSON.parse(
    readFileSync(`src/donations/choreography/donate${index + 1}/analysis.json`),
  );
  return { tier: index + 1, file: data.source, authoredDuration: data.duration };
});
assets.push({
  tier: 0,
  file: "tipply-test-tts.mp3",
  url: "/assets/sounds/shared/tipply-test-tts.mp3",
});
const results = [];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${url}/motion-studio?clean=1&tier=1&quality=safe`, {
  waitUntil: "domcontentloaded",
});
for (const asset of assets) {
  const file = asset.tier ? `public/assets/donations/audio/${asset.file}` : `public${asset.url}`;
  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_streams", "-show_format", "-show_packets", "-of", "json", file],
    { encoding: "utf8", windowsHide: true, maxBuffer: 8e6 },
  );
  if (probe.status !== 0) throw Error(probe.stderr);
  const data = JSON.parse(probe.stdout),
    audio = data.streams.find((stream) => stream.codec_type === "audio");
  const decode = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"], {
    encoding: "utf8",
    windowsHide: true,
  });
  const bytes = readFileSync(file);
  let offset = 0;
  if (bytes.subarray(0, 3).toString() === "ID3")
    offset =
      10 +
      ((bytes[6] & 127) << 21) +
      ((bytes[7] & 127) << 14) +
      ((bytes[8] & 127) << 7) +
      (bytes[9] & 127);
  let mpeg;
  for (let i = offset; i < Math.min(bytes.length - 4, offset + 8192); i++) {
    const bits = bytes.readUInt32BE(i),
      version = (bits >>> 19) & 3,
      layer = (bits >>> 17) & 3,
      rate = (bits >>> 10) & 3,
      bitrate = (bits >>> 12) & 15;
    if (
      bits >>> 21 === 2047 &&
      version !== 1 &&
      layer !== 0 &&
      rate !== 3 &&
      bitrate !== 0 &&
      bitrate !== 15
    ) {
      mpeg = { version: { 3: "1", 2: "2", 0: "2.5" }[version], layer: 4 - layer, headerOffset: i };
      break;
    }
  }
  const browserDecode = await page.evaluate(async (href) => {
    const context = new AudioContext();
    try {
      const response = await fetch(href);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      const pcm = buffer.getChannelData(0);
      let sum = 0;
      for (const value of pcm) sum += value * value;
      return {
        status: response.status,
        mime: response.headers.get("Content-Type"),
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        rms: Math.sqrt(sum / pcm.length),
      };
    } catch (error) {
      return { error: String(error) };
    } finally {
      await context.close();
    }
  }, asset.url ?? `/assets/donations/audio/${asset.file}`);
  results.push({
    ...asset,
    mpeg,
    codec: audio.codec_name,
    codecLongName: audio.codec_long_name,
    format: data.format.format_name,
    sampleRate: audio.sample_rate,
    channels: audio.channels,
    bitRate: audio.bit_rate,
    duration: data.format.duration,
    startTime: data.format.start_time,
    firstPacket:
      data.packets.find((packet) => packet.stream_index === audio.index)?.side_data_list ?? [],
    lastPacket:
      data.packets.filter((packet) => packet.stream_index === audio.index).at(-1)?.side_data_list ??
      [],
    ffmpegExit: decode.status,
    decodeWarnings: decode.stderr,
    browserDecode,
  });
}
await browser.close();
writeFileSync(`${folder}/audio-audit.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results, null, 2));
if (
  results.some(
    (item) => item.ffmpegExit !== 0 || item.browserDecode.error || item.browserDecode.rms <= 0,
  )
)
  process.exitCode = 1;
