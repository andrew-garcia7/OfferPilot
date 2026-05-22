import { useState } from "react";
import type { CompanyBrand } from "../../lib/companyLogos";
import { cdnIconUrl, clearbitLogoUrl, faviconUrl } from "../../lib/companyLogos";

type Props = {
  brand: CompanyBrand;
  size?: number;
  className?: string;
};

type Source = "cdn" | "favicon" | "clearbit";

/** Official brand mark via Simple Icons CDN, then site favicon, then Clearbit. */
export default function CompanyLogo({ brand, size = 18, className = "" }: Props) {
  const [source, setSource] = useState<Source>("cdn");

  const src =
    source === "cdn"
      ? cdnIconUrl(brand.slug, brand.color)
      : source === "favicon"
        ? faviconUrl(brand.domain, Math.max(size * 2, 32))
        : clearbitLogoUrl(brand.domain);

  const handleError = () => {
    setSource((prev) => {
      if (prev === "cdn") return "favicon";
      if (prev === "favicon") return "clearbit";
      return "clearbit";
    });
  };

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 object-contain rounded-sm ${className}`}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
