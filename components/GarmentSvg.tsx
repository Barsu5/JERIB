"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { garmentSvgMarkup } from "@/lib/garmentMarkup";
import { garmentSide } from "@/lib/parts";
import { isFootballProduct } from "@/lib/types";
import type { ProductId, View } from "@/lib/types";

type Props = {
  product: ProductId;
  color: string;
  partColors?: Record<string, string>;
  view: View;
};

export function GarmentSvg({ product, color, partColors, view }: Props) {
  const side = garmentSide(view);
  const src = `/garments/${product}-${side}.png`;
  const [imgFailed, setImgFailed] = useState(isFootballProduct(product));
  const svgMarkup = useMemo(
    () => garmentSvgMarkup(product, color, view, partColors),
    [product, color, view, partColors]
  );

  if (imgFailed) {
    return (
      <div
        className="relative h-full w-full [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0" style={{ background: color }} />
      <Image
        src={src}
        alt=""
        fill
        sizes="520px"
        className="object-contain mix-blend-multiply"
        priority
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}
