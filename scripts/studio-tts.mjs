import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
const folder = resolve(".studio-tts");
mkdirSync(folder, { recursive: true });
const pending = new Map();
const run = (command, args) =>
  new Promise((yes, no) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "",
      errors = "";
    const timer = setTimeout(() => {
      child.kill();
      no(Error("Local speech preparation timed out"));
    }, 60000);
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (errors += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      no(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      code === 0 ? yes(output) : no(Error(errors.slice(-2000)));
    });
  });
async function sapi(data, key) {
  if (process.platform !== "win32") throw Error("No local speech provider configured on this host");
  const input = resolve(folder, `${key}.request.json`);
  writeFileSync(input, JSON.stringify(data));
  return run("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    resolve("scripts/studio-tts.ps1"),
    input,
  ]);
}
let inventory;
export async function previewVoices() {
  if (!inventory)
    inventory = sapi({ action: "voices" }, "voices")
      .then((raw) => {
        const parsed = JSON.parse(raw.replace(/^\uFEFF/, ""));
        return (Array.isArray(parsed) ? parsed : [parsed]).map((voice) => ({
          ...voice,
          provider: "Windows SAPI",
          identity: createHash("sha256").update(voice.id).digest("hex"),
        }));
      })
      .catch((error) => {
        inventory = undefined;
        throw error;
      });
  return inventory;
}
export async function prepareSpeech({ voice, clips }) {
  const voices = await previewVoices();
  const chosen =
    voices.find((item) => item.identity === voice) ??
    (voice === "scene" ? (voices.find((item) => item.language === "415") ?? voices[0]) : undefined);
  if (!chosen) throw Error("Wybrany głos jest niedostępny");
  if (!Array.isArray(clips) || clips.length > 3) throw Error("Invalid speech clips");
  return Promise.all(
    clips.map(async (clip) => {
      if (
        !["nickname", "amount", "message"].includes(clip.name) ||
        typeof clip.text !== "string" ||
        clip.text.length > 5000
      )
        throw Error("Invalid speech text");
      const text = clip.text.normalize("NFC").replace(/\s+/g, " ").trim();
      const key = createHash("sha256")
        .update(JSON.stringify(["sapi-rate-1-v1", chosen.id, text]))
        .digest("hex");
      const file = resolve(folder, `${key}.wav`),
        metadata = resolve(folder, `${key}.json`);
      if (!pending.has(key) && !existsSync(metadata))
        pending.set(
          key,
          (async () => {
            await sapi({ action: "speak", voice: chosen.id, text: text || " ", output: file }, key);
            const duration = Number(
              await run("ffprobe", [
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=nw=1:nk=1",
                file,
              ]),
            );
            const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
            const data = {
              key,
              text,
              voice: chosen.name,
              voiceIdentity: chosen.identity,
              provider: chosen.provider,
              hash,
              duration,
              file: `${key}.wav`,
              url: `/__studio/tts/audio/${key}`,
            };
            writeFileSync(metadata, JSON.stringify(data, null, 2));
          })().finally(() => pending.delete(key)),
        );
      if (pending.has(key)) await pending.get(key);
      return { ...JSON.parse(readFileSync(metadata)), name: clip.name };
    }),
  );
}
export function speechFile(key) {
  if (!/^[a-f0-9]{64}$/.test(key)) throw Error("Invalid speech cache key");
  return resolve(folder, `${key}.wav`);
}
