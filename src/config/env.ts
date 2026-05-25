const DEFAULT_WS_URL = "wss://kaaajka.nedi.me/ws";

export function resolveWsUrl(value: unknown, fallback = DEFAULT_WS_URL): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export const wsUrl: string = resolveWsUrl(import.meta.env.VITE_WS_URL);
