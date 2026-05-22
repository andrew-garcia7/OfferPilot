import type { CompanyBrand } from "../../lib/companyLogos";
import CompanyLogo from "./CompanyLogo";

type Props = {
  brand: CompanyBrand;
  className?: string;
};

export default function CompanyChip({ brand, className = "" }: Props) {
  const normalized = brand.color.toLowerCase();
  const readableColor =
    normalized === "#fff" || normalized === "#ffffff" || normalized === "white"
      ? "var(--theme-text)"
      : brand.color;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 cursor-default transition-all duration-200 select-none group ${className}`}
      style={{
        background:
          brand.bg !== "transparent"
            ? brand.bg
            : "color-mix(in srgb, var(--theme-text) 6%, var(--theme-surface))",
        border: "1px solid color-mix(in srgb, var(--theme-text) 15%, transparent)",
      }}
    >
      <span className="shrink-0 opacity-90 group-hover:opacity-100 transition-opacity flex items-center">
        <CompanyLogo brand={brand} size={18} />
      </span>
      <span
        className="text-sm font-bold whitespace-nowrap transition-opacity duration-200"
        style={{ color: readableColor, opacity: 0.88 }}
      >
        {brand.name}
      </span>
    </div>
  );
}
