"use client";

import Image from "next/image";
import { garmentSide } from "@/lib/parts";
import type { ProductId, View } from "@/lib/types";

type Props = {
  product: ProductId;
  color: string;
  view: View;
};

export function GarmentSvg({ product, color, view }: Props) {
  const side = garmentSide(view);
  const src = `/garments/${product}-${side}.png`;

  return (
    <div className="relative h-full w-full">
      {/* Same box as marks/zones — no inset, so % coords line up */}
      <div className="absolute inset-0" style={{ background: color }} />
      <Image
        src={src}
        alt=""
        fill
        sizes="520px"
        className="object-contain mix-blend-multiply"
        priority
      />
    </div>
  );
}
