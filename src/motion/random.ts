export function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let n = Math.imul(state ^ (state >>> 15), 1 | state);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

export function motionIntensity(amount: number, minimum: number, nextMinimum?: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.min(
    1,
    Math.max(0, (amount - minimum) / Math.max(1, (nextMinimum ?? minimum * 2) - minimum)),
  );
}
