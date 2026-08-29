"use client";

import { useRef, useState } from "react";
import { GarmentSvg } from "@/components/GarmentSvg";
import { layerVisibleOnView } from "@/lib/parts";
import type { LookDesign } from "@/lib/designTexture";
import type { DesignLayer, View } from "@/lib/types";

function Mark({ layer }: { layer: DesignLayer }) {
  if (layer.kind === "text") {
    return (
      <p
        className="max-w-[180px] text-center font-display text-2xl leading-tight"
        style={{ color: layer.color }}
      >
        {layer.content}
      </p>
    );
  }
  if (layer.kind === "symbol") {
    return (
      <span className="font-display text-5xl" style={{ color: layer.color }}>
        {layer.content}
      </span>
    );
  }
  if (layer.kind === "image" || layer.kind === "logo" || layer.kind === "drawing") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={layer.content} alt="" className="max-h-32 max-w-32 object-contain" />;
  }
  return (
    <span className="text-[10px] uppercase tracking-widest" style={{ color: layer.color }}>
      {layer.content}
    </span>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawLayer(ctx: CanvasRenderingContext2D, layer: DesignLayer, size: number) {
  const x = (layer.x / 100) * size;
  const y = (layer.y / 100) * size;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.scale, layer.scale);

  if (layer.kind === "text") {
    ctx.fillStyle = layer.color;
    ctx.font = "600 56px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.content, 0, 0, 360);
  } else if (layer.kind === "symbol") {
    ctx.fillStyle = layer.color;
    ctx.font = "96px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.content, 0, 0);
  } else if (layer.kind === "image" || layer.kind === "logo" || layer.kind === "drawing") {
    try {
      const img = await loadImage(layer.content);
      ctx.drawImage(img, -90, -90, 180, 180);
    } catch {
      /* ignore */
    }
  } else {
    ctx.fillStyle = layer.color;
    for (let i = -60; i < 60; i += 14) ctx.fillRect(i, -50, 7, 100);
  }
  ctx.restore();
}

export async function exportDesignPng(design: LookDesign, view: View = "front") {
  const size = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a1714";
  ctx.fillRect(0, 0, size, size);

  const photo = await loadImage(`/garments/${design.productId}-${view}.png`);
  const scale = Math.min(size / photo.naturalWidth, size / photo.naturalHeight) * 0.9;
  const dw = Math.round(photo.naturalWidth * scale);
  const dh = Math.round(photo.naturalHeight * scale);
  const dx = Math.round((size - dw) / 2);
  const dy = Math.round((size - dh) / 2);

  const g = document.createElement("canvas");
  g.width = dw;
  g.height = dh;
  const gctx = g.getContext("2d")!;
  gctx.fillStyle = design.colorHex;
  gctx.fillRect(0, 0, dw, dh);
  gctx.globalCompositeOperation = "multiply";
  gctx.drawImage(photo, 0, 0, dw, dh);

  const colored = gctx.getImageData(0, 0, dw, dh);
  gctx.globalCompositeOperation = "source-over";
  gctx.clearRect(0, 0, dw, dh);
  gctx.drawImage(photo, 0, 0, dw, dh);
  const src = gctx.getImageData(0, 0, dw, dh);
  for (let i = 0; i < src.data.length; i += 4) {
    const lum = 0.2126 * src.data[i] + 0.7152 * src.data[i + 1] + 0.0722 * src.data[i + 2];
    colored.data[i + 3] = lum < 28 ? 0 : 255;
  }
  gctx.putImageData(colored, 0, 0);
  ctx.drawImage(g, dx, dy);

  const layers = design.layers.filter((l) =>
    layerVisibleOnView(design.productId, l.placement, view)
  );
  for (const mark of layers) await drawLayer(ctx, mark, size);

  return canvas.toDataURL("image/png");
}

export function FinalPreview({
  design,
  view,
}: {
  design: LookDesign;
  view: View;
}) {
  const marks = design.layers.filter((l) =>
    layerVisibleOnView(design.productId, l.placement, view)
  );

  return (
    <div className="relative mx-auto h-full w-full max-w-[520px]">
      <GarmentSvg product={design.productId} color={design.colorHex} view={view} />
      {marks.map((layer) => (
        <div
          key={layer.id}
          className="pointer-events-none absolute z-20 flex items-center justify-center"
          style={{
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
          }}
        >
          <Mark layer={layer} />
        </div>
      ))}
    </div>
  );
}

export function useDownloadDesign(design: LookDesign) {
  const [busy, setBusy] = useState(false);
  const lastView = useRef<View>("front");

  const download = async (view: View = "front") => {
    lastView.current = view;
    setBusy(true);
    try {
      const url = await exportDesignPng(design, view);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jerib-${design.productId}-${view}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return { download, busy };
}
