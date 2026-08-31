"use client";

import { useEffect, useMemo, useState } from "react";
import { garmentSvgMarkup } from "@/lib/garmentMarkup";
import type { ProductId } from "@/lib/types";
import { useT, type DictKey } from "@/lib/i18n";

const JERSEY_KITS = [
  { body: "#141414", sleeves: "#9c2b2b", collar: "#c4a574" },
  { body: "#1c2744", sleeves: "#ffffff", collar: "#9c2b2b" },
  { body: "#9c2b2b", sleeves: "#141414", collar: "#ffffff" },
] as const;

const HOODIE_COLORS = ["#1c2744", "#9c2b2b", "#141414", "#3d4630", "#f4efe6"] as const;

type TileConfig = {
  product: ProductId;
  bg: string;
  dark?: boolean;
  labelKey: DictKey;
  color: string;
  partColors?: Record<string, string>;
  view?: "front" | "back";
  large?: boolean;
};

function ScanLine() {
  return <div className="hero-scan-line pointer-events-none absolute inset-x-4 z-20 h-px bg-clay/70 shadow-[0_0_12px_rgba(156,43,43,0.5)]" />;
}

function PrintBadge({
  label,
  delay = 0,
  className = "",
}: {
  label: string;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`hero-print-badge absolute z-10 flex items-center justify-center rounded-md bg-clay/90 font-display text-white shadow-lg ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {label}
    </div>
  );
}

function ZoneGuide({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div
      className={`hero-zone-guide absolute z-[5] rounded border-2 border-dashed border-clay/70 ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function GarmentPreview({
  product,
  color,
  partColors,
  view = "front",
  large,
}: {
  product: ProductId;
  color: string;
  partColors?: Record<string, string>;
  view?: "front" | "back";
  large?: boolean;
}) {
  const svg = useMemo(
    () => garmentSvgMarkup(product, color, view, partColors),
    [product, color, view, partColors]
  );

  return (
    <div
      className={`hero-garment-float relative mx-auto [&>svg]:h-full [&>svg]:w-full ${large ? "h-44 w-36 sm:h-52 sm:w-44" : "h-14 w-12 sm:h-16 sm:w-14"}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function HeroMockupGrid() {
  const t = useT();
  const [hoodieColor, setHoodieColor] = useState<string>(HOODIE_COLORS[0]);
  const [jerseyKit, setJerseyKit] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % HOODIE_COLORS.length;
      setHoodieColor(HOODIE_COLORS[i]!);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setJerseyKit((k) => (k + 1) % JERSEY_KITS.length);
      setShowBack((b) => !b);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const kit = JERSEY_KITS[jerseyKit]!;

  const tiles: TileConfig[] = [
    { product: "hoodie", bg: "bg-slate-100", labelKey: "product_hoodie", color: hoodieColor, large: true },
    { product: "tshirt", bg: "bg-sky-100", labelKey: "product_tshirt", color: "#f4efe6" },
    { product: "cap", bg: "bg-slate-800", labelKey: "product_cap", color: "#141414", dark: true },
    {
      product: "football_jersey",
      bg: "bg-amber-100",
      labelKey: "product_football_jersey",
      color: kit.body,
      partColors: { ...kit },
      view: showBack ? "back" : "front",
    },
  ];

  const main = tiles[0]!;
  const side = tiles.slice(1);

  return (
    <div className="grid h-full min-h-[320px] grid-cols-[1.4fr_1fr] gap-3 sm:min-h-[400px]">
      {/* Hoodie — main editing demo */}
      <div className={`relative overflow-hidden rounded-2xl ${main.bg} flex flex-col items-center justify-center p-4 sm:p-6`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
        <span className="relative z-10 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {t(main.labelKey)}
        </span>

        <div className="relative mt-2 w-full flex-1">
          <GarmentPreview product="hoodie" color={hoodieColor} large />
          <ZoneGuide className="left-[34%] top-[22%] h-[18%] w-[32%]" />
          <PrintBadge label="JIRIB" delay={400} className="left-[36%] top-[26%] h-7 w-14 text-[9px] tracking-widest" />
          <ScanLine />
          <div className="hero-color-swatch absolute bottom-3 left-3 flex gap-1.5">
            {HOODIE_COLORS.map((c) => (
              <span
                key={c}
                className={`h-4 w-4 rounded-full border-2 transition-transform ${c === hoodieColor ? "scale-125 border-clay" : "border-white/80"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Side tiles */}
      <div className="grid grid-rows-3 gap-3">
        {/* T-shirt */}
        <div className={`relative overflow-hidden rounded-2xl ${side[0]!.bg} flex flex-col items-center justify-center p-2`}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t(side[0]!.labelKey)}
          </span>
          <div className="relative mt-1 w-full flex-1">
            <GarmentPreview product="tshirt" color="#f4efe6" />
            <ZoneGuide className="left-[30%] top-[28%] h-[22%] w-[40%]" delay={200} />
            <div className="hero-stamp-icon absolute left-[38%] top-[32%] z-10 text-lg text-clay">★</div>
          </div>
        </div>

        {/* Cap */}
        <div className={`relative overflow-hidden rounded-2xl ${side[1]!.bg} flex flex-col items-center justify-center p-2`}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {t(side[1]!.labelKey)}
          </span>
          <div className="relative mt-1 w-full flex-1">
            <GarmentPreview product="cap" color="#141414" />
            <PrintBadge label="J" delay={600} className="left-[38%] top-[30%] h-5 w-5 text-[8px]" />
          </div>
        </div>

        {/* Football jersey */}
        <div className={`relative overflow-hidden rounded-2xl ${side[2]!.bg} flex flex-col items-center justify-center p-2`}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t(side[2]!.labelKey)}
          </span>
          <div className="relative mt-1 w-full flex-1">
            <GarmentPreview
              product="football_jersey"
              color={kit.body}
              partColors={{ ...kit }}
              view={showBack ? "back" : "front"}
            />
            {showBack ? (
              <PrintBadge label="10" delay={0} className="left-[40%] top-[30%] h-6 w-8 text-sm font-bold" />
            ) : (
              <ZoneGuide className="left-[32%] top-[26%] h-[16%] w-[36%]" delay={100} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
