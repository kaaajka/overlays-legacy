const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

export const AppConfig = {
  ws: import.meta.env.VITE_WS_URL || "wss://kaaajka.nedi.me/ws",
  assetUrl: (path: string) => `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
};
