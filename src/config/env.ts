export type AppEnv = "prod" | "test" | "dev" | "unknown";

const DEFAULT_WS_URL = "wss://kaaajka.nedi.me/ws";

export function parseAppEnv(value: unknown): AppEnv {
  if (value === "prod" || value === "test" || value === "dev") {
    return value;
  }

  return "unknown";
}

export function resolveWsUrl(value: unknown, fallback = DEFAULT_WS_URL): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export const appEnv: AppEnv = parseAppEnv(import.meta.env.VITE_APP_ENV);
export const wsUrl: string = resolveWsUrl(import.meta.env.VITE_WS_URL);
