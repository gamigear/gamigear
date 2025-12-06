/**
 * Server component to preload hero banner images
 * This helps eliminate the delay when loading the first banner
 */

interface Banner {
  image: string;
  tabletImage?: string | null;
  mobileImage?: string | null;
}

interface HeroBannerPreloadProps {
  banners: Banner[];
}

export default function HeroBannerPreload({ banners }: HeroBannerPreloadProps) {
  if (!banners || banners.length === 0) return null;
  
  const firstBanner = banners[0];
  const desktopImage = firstBanner.tabletImage || firstBanner.image;
  const mobileImage = firstBanner.mobileImage || firstBanner.tabletImage || firstBanner.image;

  return (
    <>
      {/* Preload desktop banner image */}
      <link
        rel="preload"
        as="image"
        href={desktopImage}
        media="(min-width: 1025px)"
        fetchPriority="high"
      />
      {/* Preload mobile banner image */}
      <link
        rel="preload"
        as="image"
        href={mobileImage}
        media="(max-width: 1024px)"
        fetchPriority="high"
      />
    </>
  );
}
