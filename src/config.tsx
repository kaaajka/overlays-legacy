import { wsUrl } from "./config/env";

const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

export const AppConfig = {
  ws: wsUrl,
  assetUrl: (path: string) => `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
};
