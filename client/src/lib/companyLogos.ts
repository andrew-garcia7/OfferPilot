export type CompanyBrand = {
  name: string;
  /** simple-icons slug — used with cdn.simpleicons.org */
  slug: string;
  color: string;
  bg: string;
  /** Site domain for favicon / Clearbit fallback */
  domain: string;
};

export function cdnIconUrl(slug: string, color?: string): string {
  const hex = color?.replace("#", "");
  return hex
    ? `https://cdn.simpleicons.org/${slug}/${hex}`
    : `https://cdn.simpleicons.org/${slug}`;
}

export function faviconUrl(domain: string, size = 32): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function clearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
}
