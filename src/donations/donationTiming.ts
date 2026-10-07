export function messageReadingMs(message: string): number {
  return Math.max(5500, 5000 + (message.length / 18) * 1000);
}

/** Shared deterministic export plan; live playback still runs runMotionDonation. */
export function lifecyclePlan(
  musicDuration: number,
  message: string,
  speech: { name: string; duration: number }[],
) {
  let cursor = musicDuration;
  const stages = [{ name: "hero", start: 0, end: musicDuration }];
  for (const clip of speech) {
    stages.push({ name: `tts-${clip.name}`, start: cursor, end: cursor + clip.duration });
    cursor += clip.duration;
  }
  const end = Math.max(cursor, musicDuration + messageReadingMs(message) / 1000);
  stages.push(
    { name: "information", start: musicDuration, end },
    { name: "outro", start: end, end: end + 0.65 },
  );
  return {
    stages,
    duration: end + 0.65,
    informationStart: musicDuration,
    informationDuration: end - musicDuration,
  };
}
