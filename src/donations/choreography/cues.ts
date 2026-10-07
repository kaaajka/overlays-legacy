import type { Cue, CueName } from "../../motion/types";

export function authorCues(
  duration: number,
  times: [number, number, number, number, number, number],
): Cue[] {
  const names: CueName[] = [
    "firstImpact",
    "donorReveal",
    "buildStart",
    "preDrop",
    "heroDrop",
    "settle",
  ];
  return [
    { name: "intro", at: 0, intensity: 0.1 },
    ...times.map((at, index) => ({
      name: names[index],
      at,
      intensity: [0.35, 0.5, 0.65, 0.1, 1, 0.25][index],
    })),
    { name: "information", at: duration, intensity: 0 },
  ];
}

export function validateCues(cues: Cue[], duration: number): Cue[] {
  const names = new Set<string>();
  let previous = -1;
  for (const cue of cues) {
    if (
      !Number.isFinite(cue.at) ||
      cue.at < 0 ||
      cue.at > duration ||
      cue.at < previous ||
      names.has(cue.name)
    )
      throw new Error(`Invalid cue: ${cue.name}`);
    if (cue.intensity < 0 || cue.intensity > 1) throw new Error(`Invalid intensity: ${cue.name}`);
    previous = cue.at;
    names.add(cue.name);
  }
  for (const required of ["intro", "donorReveal", "preDrop", "heroDrop", "settle", "information"]) {
    if (!names.has(required)) throw new Error(`Missing cue: ${required}`);
  }
  return cues;
}
