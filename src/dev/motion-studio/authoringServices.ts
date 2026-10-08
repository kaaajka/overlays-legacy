export type PreviewVoice = {
  identity: string;
  name: string;
  provider: string;
  language: string;
  gender: string;
};
export type SpeechClip = {
  name: string;
  text: string;
  voice: string;
  voiceIdentity: string;
  provider: string;
  hash: string;
  duration: number;
  file: string;
  url: string;
  key: string;
};
async function request<T>(path: string, data?: unknown, timeout = 65000): Promise<T> {
  const response = await fetch(`/__studio/${path}`, {
    ...(data === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
    signal: AbortSignal.timeout(timeout),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error ?? "Usługi lokalne są niedostępne");
  return result;
}
/** Browser/PWA adapter. A desktop host can implement the same interface. */
export const authoringServices = {
  capabilities: () =>
    request<{ export: boolean; tts: boolean; persistence: boolean }>(
      "capabilities",
      undefined,
      4000,
    ),
  voices: () => request<PreviewVoice[]>("tts/voices"),
  prepareSpeech: (voice: string, clips: { name: string; text: string }[]) =>
    request<SpeechClip[]>("tts/prepare", { voice, clips }),
  export: (data: unknown) => request<{ id: string; state: string; error?: string }>("export", data),
  exportStatus: (id: string) =>
    request<{ id: string; state: string; progress?: number; error?: string }>(`export/${id}`),
  persist: (data: unknown) => request("corrections", data),
};
