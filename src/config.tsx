import { resolvePublicAssetUrl } from "./assets/resolveOverlayAssetUrl";
import { wsUrl } from "./config/env";

export const AppConfig = {
  ws: wsUrl,
  assetUrl: resolvePublicAssetUrl,
};
