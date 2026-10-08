import {
  createReadStream,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn, execFile } from "node:child_process";
import { previewVoices, prepareSpeech, speechFile } from "./studio-tts.mjs";

/** Authoring services exist only on Vite's local development server. */
/** @returns {import("vite").Plugin} */
export function motionStudioServer() {
  const jobs = new Map();
  const commandAvailable = (command) =>
    new Promise((resolve) => {
      execFile(command, ["-version"], { windowsHide: true, timeout: 3000 }, (error) =>
        resolve(!error),
      );
    });
  let capabilities;
  const discoverCapabilities = () =>
    (capabilities ??= Promise.all([
      commandAvailable("ffmpeg"),
      commandAvailable("ffprobe"),
      previewVoices().catch(() => []),
    ]).then(([ffmpeg, ffprobe, voices]) => ({
      export: ffmpeg && ffprobe,
      tts: voices.length > 0,
      persistence: true,
      node: process.versions.node,
      ffmpeg,
      ffprobe,
    })));
  return {
    name: "motion-studio-local",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith("/__studio")) return next();
        if (
          req.headers.origin &&
          !["localhost", "127.0.0.1", "[::1]"].includes(new URL(req.headers.origin).hostname)
        ) {
          res.statusCode = 403;
          return res.end("Local authoring only");
        }
        const json = (value, status = 200) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(value));
        };
        try {
          if (url.pathname === "/__studio/capabilities") return json(await discoverCapabilities());
          if (url.pathname === "/__studio/tts/voices" && req.method === "GET")
            return json(await previewVoices());
          if (url.pathname.startsWith("/__studio/tts/audio/") && req.method === "GET") {
            const file = speechFile(url.pathname.split("/").at(-1));
            if (!existsSync(file)) return json({ error: "Speech not prepared" }, 404);
            res.setHeader("Content-Type", "audio/wav");
            res.setHeader("Content-Length", statSync(file).size);
            return createReadStream(file).pipe(res);
          }
          // Chrome on this workstation receives injected empty 204s for .mp3 URLs.
          // Serve the unchanged original through a local authoring URL, with no transcode.
          const music = /^\/__studio-assets\/music\/(5|7)$/.exec(url.pathname);
          if (music && req.method === "GET") {
            const file = resolve(
              `public/assets/donations/audio/donation-template-0${music[1]}.mp3`,
            );
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Length", statSync(file).size);
            res.setHeader("Cache-Control", "no-cache");
            return createReadStream(file).pipe(res);
          }
          if (url.pathname === "/__studio/audio-failure" && req.method === "POST") {
            let data = "";
            for await (const chunk of req) {
              data += chunk;
              if (data.length > 2_000_000) throw Error("Diagnostic too large");
            }
            const value = JSON.parse(data);
            const id = randomUUID();
            const folder = resolve(".motion-qa/production-2.2/audio");
            mkdirSync(folder, { recursive: true });
            writeFileSync(resolve(folder, `${id}.bin`), Buffer.from(value.bytes ?? "", "base64"));
            writeFileSync(resolve(folder, `${id}.json`), JSON.stringify(value.record, null, 2));
            return json({ id });
          }
          if (url.pathname === "/__studio-assets/stream/kaaajka-rocket-league.jpg") {
            res.setHeader("Content-Type", "image/jpeg");
            return createReadStream(
              resolve("dev-assets/studio-stream/kaaajka-rocket-league.jpg"),
            ).pipe(res);
          }
          if (
            req.method === "GET" &&
            url.pathname.startsWith("/__studio/export/") &&
            url.pathname.endsWith("/stream")
          ) {
            const job = jobs.get(url.pathname.split("/")[3]);
            if (!job?.streamFile) return json({ error: "No custom stream frame" }, 404);
            res.setHeader("Content-Type", job.streamType);
            return createReadStream(job.streamFile).pipe(res);
          }
          if (url.pathname.startsWith("/__studio-assets/speech/")) {
            const file = url.pathname.split("/").at(-1);
            if (!["nickname.wav", "amount.wav", "message.wav"].includes(file)) {
              res.statusCode = 404;
              return res.end();
            }
            res.setHeader("Content-Type", "audio/wav");
            return createReadStream(resolve("dev-assets/studio-speech", file)).pipe(res);
          }
          if (req.method === "GET" && url.pathname.startsWith("/__studio/export/")) {
            const id = url.pathname.split("/")[3],
              job = jobs.get(id);
            if (!job) return json({ error: "Unknown export" }, 404);
            if (url.pathname.endsWith("/file") && job.state === "complete") {
              res.setHeader("Content-Disposition", `attachment; filename="${id}.${job.format}"`);
              res.setHeader("Content-Type", job.format === "mp4" ? "video/mp4" : "video/webm");
              return createReadStream(job.file).pipe(res);
            }
            return json(job);
          }
          let body = "";
          for await (const chunk of req) {
            body += chunk;
            if (body.length > (url.pathname === "/__studio/export" ? 3_000_000 : 512000))
              throw Error("Request too large");
          }
          const value = JSON.parse(body);
          if (url.pathname === "/__studio/corrections" && req.method === "POST") {
            const tier = Number(value.tier);
            if (!Number.isInteger(tier) || tier < 1 || tier > 7) throw Error("Invalid tier");
            const analysis = JSON.parse(
              readFileSync(resolve(`src/donations/choreography/donate${tier}/analysis.json`)),
            );
            if (value.authored?.sourceSha256 !== analysis.sourceSha256)
              throw Error("Source hash mismatch");
            const authored = value.authored;
            for (const group of ["words", "vocalPhrases", "sections"])
              for (const region of authored[group] ?? []) {
                if (
                  !Number.isFinite(region.start) ||
                  !Number.isFinite(region.end) ||
                  region.start < 0 ||
                  region.end <= region.start ||
                  region.end > analysis.duration
                )
                  throw Error("Invalid timing");
              }
            mkdirSync(resolve("src/donations/music-authoring"), { recursive: true });
            writeFileSync(
              resolve(`src/donations/music-authoring/donate${tier}.json`),
              JSON.stringify(authored, null, 2) + "\n",
            );
            analysis.intelligence.authored = authored;
            writeFileSync(
              resolve(`src/donations/choreography/donate${tier}/analysis.json`),
              JSON.stringify(analysis) + "\n",
            );
            return json({ saved: true });
          }
          if (url.pathname === "/__studio/tts/prepare" && req.method === "POST")
            return json(await prepareSpeech(value));
          if (url.pathname !== "/__studio/export" || req.method !== "POST")
            return json({ error: "Unknown endpoint" }, 404);
          if (
            [...jobs.values()].some((job) => job.state === "rendering" || job.state === "encoding")
          )
            return json({ error: "An export is already running" }, 409);
          if (!Number.isInteger(value.tier) || value.tier < 1 || value.tier > 8)
            throw Error("Invalid tier");
          if (
            ![30, 60].includes(value.fps) ||
            !["mp4", "webm"].includes(value.format) ||
            !["hero", "full", "selection", "cue"].includes(value.range)
          )
            throw Error("Invalid export options");
          if (!["transparent", "solid", "stream"].includes(value.background))
            throw Error("Invalid background");
          if (value.format === "mp4" && value.background === "transparent")
            throw Error("MP4 has no alpha. Choose solid/stream or WebM.");
          if (
            !Number.isSafeInteger(value.amount) ||
            value.amount < 0 ||
            typeof value.nickname !== "string" ||
            typeof value.message !== "string"
          )
            throw Error("Invalid donation data");
          const id = randomUUID(),
            folder = resolve(".motion-exports", id);
          mkdirSync(folder, { recursive: true });
          let streamFile, streamType;
          if (value.streamFrame && value.background === "stream") {
            const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
              value.streamFrame,
            );
            if (!match) throw Error("Custom stream frame must be PNG, JPEG or WebP");
            streamType = match[1];
            streamFile = resolve(folder, "stream-frame");
            writeFileSync(streamFile, Buffer.from(match[2], "base64"));
          }
          const request = {
            ...value,
            streamFrame: streamFile ? `/__studio/export/${id}/stream` : undefined,
            url: `http://127.0.0.1:${server.config.server.port}`,
            id,
          };
          const requestFile = resolve(folder, "request.json");
          writeFileSync(requestFile, JSON.stringify(request));
          const job = {
            id,
            streamFile,
            streamType,
            state: "rendering",
            progress: 0,
            format: value.format,
            file: resolve(folder, `export.${value.format}`),
          };
          jobs.set(id, job);
          const worker = spawn(
            process.execPath,
            ["scripts/render-donation.mjs", "--request", requestFile],
            { cwd: process.cwd(), windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
          );
          let pending = "",
            errors = "";
          worker.stdout.on("data", (chunk) => {
            pending += chunk;
            const lines = pending.split("\n");
            pending = lines.pop();
            for (const line of lines) {
              try {
                Object.assign(job, JSON.parse(line));
              } catch {
                /* FFmpeg diagnostics are not progress. */
              }
            }
          });
          worker.stderr.on("data", (chunk) => {
            errors = (errors + chunk).slice(-6000);
          });
          worker.on("error", (error) => {
            job.state = "failed";
            job.error = String(error);
          });
          worker.on("close", (code) => {
            job.state = code === 0 && existsSync(job.file) ? "complete" : "failed";
            job.progress = code === 0 ? 1 : job.progress;
            if (code !== 0) job.error = errors || `Worker exited ${code}`;
          });
          return json(job, 202);
        } catch (error) {
          json({ error: String(error) }, 400);
        }
      });
    },
  };
}
