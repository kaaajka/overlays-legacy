import { debugLog } from "../../debug";
import { getLegacyFixture, listLegacyFixtureNames } from "./fixtureIndex";
import type { LegacyFixtureReplaySequence } from "./fixtureIndex";

let fixtureAudioUnlocked = false;
let fixtureAudioUnlockPrompt: HTMLDivElement | undefined;
type FixtureReplayTimer = ReturnType<typeof setTimeout>;

const scheduledFixtureReplayTimers = new Set<FixtureReplayTimer>();

export function isLegacyFixtureReplayEnabled(): boolean {
  return import.meta.env.DEV === true || import.meta.env.VITE_ENABLE_FIXTURE_REPLAY === "true";
}

export function getRequestedLegacyFixtureName(search = window.location.search): string | undefined {
  const params = new URLSearchParams(search);
  const fixture = params.get("fixture")?.trim();

  return fixture || undefined;
}

export function isRequestedLegacyFixtureReplayActive(search = window.location.search): boolean {
  const fixtureName = getRequestedLegacyFixtureName(search);

  return !!fixtureName && isLegacyFixtureReplayEnabled() && !!getLegacyFixture(fixtureName);
}

export function isDevFixtureAudioMuted(search = window.location.search): boolean {
  if (!isRequestedLegacyFixtureReplayActive(search)) return false;

  const params = new URLSearchParams(search);
  const value = params.get("muteAudio")?.trim().toLowerCase();

  return value === "true" || value === "1";
}

export function isDevFixtureFastMode(search = window.location.search): boolean {
  if (!isDevFixtureAudioMuted(search)) return false;

  const params = new URLSearchParams(search);
  const value = params.get("fast")?.trim().toLowerCase();

  return value === "true" || value === "1";
}

export type MutedFixtureAudioKind =
  | "template"
  | "tts-nickname"
  | "tts-amount"
  | "tts-message"
  | "fallback";

export type MutedFixtureAudioDelayOptions = {
  kind?: MutedFixtureAudioKind;
  label?: string;
  search?: string;
};

export function getMutedFixtureAudioDelayMs(options: MutedFixtureAudioDelayOptions = {}): number {
  const search = options.search ?? window.location.search;
  if (!isDevFixtureAudioMuted(search) || isDevFixtureFastMode(search)) return 0;

  if (options.kind === "template") return 4000;
  if (options.kind === "tts-nickname") return 1000;
  if (options.kind === "tts-amount") return 1000;
  if (options.kind === "tts-message") return 3500;

  const label = options.label?.toLowerCase() ?? "";
  if (label.includes("template") || label.includes("local")) return 4000;
  if (label.includes("nickname")) return 1000;
  if (label.includes("amount")) return 1000;
  if (label.includes("message")) return 3500;

  return 1500;
}

export function markFixtureAudioUnlocked(): void {
  fixtureAudioUnlocked = true;
}

export function shouldWaitForFixtureAudioUnlock(search = window.location.search): boolean {
  return (
    isRequestedLegacyFixtureReplayActive(search) &&
    !isDevFixtureAudioMuted(search) &&
    !fixtureAudioUnlocked
  );
}

function clearScheduledFixtureReplayTimers(): void {
  for (const timer of scheduledFixtureReplayTimers) {
    clearTimeout(timer);
  }

  scheduledFixtureReplayTimers.clear();
}

export function cleanupFixtureAudioUnlockPrompt(): void {
  fixtureAudioUnlockPrompt?.remove();
  fixtureAudioUnlockPrompt = undefined;
  clearScheduledFixtureReplayTimers();
}

function tryUnlockBrowserAudio(): void {
  const AudioContextConstructor =
    window.AudioContext ||
    (
      window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextConstructor) return;

  try {
    const context = new AudioContextConstructor();
    context.resume().catch((error) => {
      debugLog("Fixture audio context resume failed safely", error);
    });
  } catch (error) {
    debugLog("Fixture audio unlock failed safely", error);
  }
}

function showFixtureAudioUnlockPrompt(onUnlock: () => void): void {
  cleanupFixtureAudioUnlockPrompt();

  const root = document.createElement("div");
  root.setAttribute("data-dev-fixture-audio-unlock", "true");
  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.72)",
    fontFamily: "Arial, sans-serif",
  });

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Click to start fixture preview with audio";
  Object.assign(button.style, {
    padding: "18px 24px",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: "12px",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: "1.2",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  });

  button.addEventListener(
    "click",
    () => {
      markFixtureAudioUnlocked();
      cleanupFixtureAudioUnlockPrompt();
      tryUnlockBrowserAudio();
      debugLog("Started legacy fixture replay after audio unlock click");
      onUnlock();
    },
    { once: true },
  );

  root.appendChild(button);
  document.body.appendChild(root);
  fixtureAudioUnlockPrompt = root;
}

function isLegacyFixtureReplaySequence(value: unknown): value is LegacyFixtureReplaySequence {
  return (
    Array.isArray(value) &&
    value.every((step) => {
      if (!step || typeof step !== "object") return false;

      return "payload" in step;
    })
  );
}

function scheduleFixturePayload(delayMs: number, replayPayload: () => void): void {
  const timer = setTimeout(() => {
    scheduledFixtureReplayTimers.delete(timer);
    replayPayload();
  }, delayMs);

  scheduledFixtureReplayTimers.add(timer);
}

function replayLegacyFixtureEntry(
  fixture: unknown,
  handlePayload: (payload: unknown) => void,
  search: string,
): void {
  clearScheduledFixtureReplayTimers();

  if (!isLegacyFixtureReplaySequence(fixture)) {
    scheduleFixturePayload(0, () => {
      handlePayload(fixture);
    });
    return;
  }

  let elapsedMs = 0;
  const fastMode = isDevFixtureFastMode(search);

  for (const step of fixture) {
    elapsedMs += fastMode ? (step.fastDelayMs ?? step.delayMs ?? 0) : (step.delayMs ?? 0);

    scheduleFixturePayload(elapsedMs, () => {
      handlePayload(step.payload);
    });
  }
}

export function replayRequestedLegacyFixture(
  handlePayload: (payload: unknown) => void,
  search = window.location.search,
): boolean {
  const fixtureName = getRequestedLegacyFixtureName(search);
  if (!fixtureName) return false;

  if (!isLegacyFixtureReplayEnabled()) {
    debugLog("Legacy fixture replay ignored outside dev mode", fixtureName);
    return false;
  }

  const fixture = getLegacyFixture(fixtureName);
  if (!fixture) {
    debugLog("Unknown legacy fixture replay name", {
      fixtureName,
      availableFixtures: listLegacyFixtureNames(),
    });
    return false;
  }

  if (shouldWaitForFixtureAudioUnlock(search)) {
    showFixtureAudioUnlockPrompt(() => {
      replayLegacyFixtureEntry(fixture, handlePayload, search);
    });
    return true;
  }

  replayLegacyFixtureEntry(fixture, handlePayload, search);

  return true;
}
