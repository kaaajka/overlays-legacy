import { resolvePublicAssetUrl, resolveDonationGifUrl } from "../../assets/resolveOverlayAssetUrl";
import assets from "./assets.json";

export function mediaUrls(tier: number) {
  const stem = `assets/donations/media/donation-template-${String(tier).padStart(2, "0")}`;
  return {
    webm: resolvePublicAssetUrl(`${stem}.webm`),
    poster: resolvePublicAssetUrl(`${stem}.png`),
    gif: resolveDonationGifUrl(tier),
  };
}
export { assets as mediaAssets };

export function SourceMedia({
  tier,
  className = "",
  delay = 0,
}: {
  tier: number;
  className?: string;
  delay?: number;
}) {
  const asset = assets[tier - 1];
  return (
    <div className={`source-media ${className}`} data-media-tier={tier} data-media-delay={delay}>
      <img className="source-fallback" src={mediaUrls(tier).poster} alt="" aria-hidden="true" />
      <video
        className="source-video"
        muted
        playsInline
        preload="auto"
        poster={mediaUrls(tier).poster}
        width={asset.width}
        height={asset.height}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
