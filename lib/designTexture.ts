import type { DesignLayer, ProductId, View } from "./types";
import { layerVisibleOnView } from "./parts";
import { garmentSvgMarkup, svgToImage } from "./garmentMarkup";

export type LookDesign = {
  productId: ProductId;
  colorHex: string;
  partColors?: Record<string, string>;
  layers: DesignLayer[];
  size: string;
};

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: DesignLayer,
  w: number,
  h: number
) {
  const x = (layer.x / 100) * w;
  const y = (layer.y / 100) * h;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.scale, layer.scale);

  if (layer.kind === "text") {
    ctx.fillStyle = layer.color;
    ctx.font = "600 42px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.content, 0, 0, 280);
  } else if (layer.kind === "symbol") {
    ctx.fillStyle = layer.color;
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.content, 0, 0);
  } else if (layer.kind === "pattern") {
    ctx.fillStyle = layer.color;
    if (layer.content === "stripes") {
      for (let i = -60; i < 60; i += 12) ctx.fillRect(i, -50, 6, 100);
    } else if (layer.content === "dots") {
      for (let i = -40; i <= 40; i += 20) {
        for (let j = -40; j <= 40; j += 20) {
          ctx.beginPath();
          ctx.arc(i, j, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(-40, -40, 80, 80);
    }
  } else {
    const img = new Image();
    img.src = layer.content;
    if (img.complete && img.naturalWidth) {
      ctx.drawImage(img, -50, -50, 100, 100);
    }
  }
  ctx.restore();
}

export function makeSideTexture(
  design: LookDesign,
  view: View,
  size = 1024
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = design.colorHex;
  ctx.fillRect(0, 0, size, size);

  const layers = design.layers.filter((l) =>
    layerVisibleOnView(design.productId, l.placement, view)
  );
  for (const layer of layers) {
    if (layer.kind === "image" || layer.kind === "logo" || layer.kind === "drawing") continue;
    drawLayer(ctx, layer, size, size);
  }
  return canvas;
}

export async function makeSideTextureAsync(design: LookDesign, view: View, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = design.colorHex;
  ctx.fillRect(0, 0, size, size);

  const layers = design.layers.filter((l) =>
    layerVisibleOnView(design.productId, l.placement, view)
  );
  for (const layer of layers) {
    if (layer.kind === "image" || layer.kind === "logo" || layer.kind === "drawing") {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const x = (layer.x / 100) * size;
          const y = (layer.y / 100) * size;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.scale(layer.scale, layer.scale);
          ctx.drawImage(img, -70, -70, 140, 140);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = layer.content;
      });
    } else {
      drawLayer(ctx, layer, size, size);
    }
  }
  return canvas;
}

export async function makePrintTextureAsync(design: LookDesign, view: View, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const layers = design.layers.filter((l) =>
    layerVisibleOnView(design.productId, l.placement, view)
  );
  for (const layer of layers) {
    if (layer.kind === "image" || layer.kind === "logo" || layer.kind === "drawing") {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const x = (layer.x / 100) * size;
          const y = (layer.y / 100) * size;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.scale(layer.scale, layer.scale);
          ctx.drawImage(img, -70, -70, 140, 140);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = layer.content;
      });
    } else {
      drawLayer(ctx, layer, size, size);
    }
  }
  return canvas;
}

export async function makeGarmentMockupAsync(design: LookDesign, view: View, size = 2048) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const shirt = await svgToImage(garmentSvgMarkup(design.productId, design.colorHex, view));
  ctx.drawImage(shirt, 0, 0, size, size);

  const pixels = ctx.getImageData(0, 0, size, size);
  const d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16) continue;
    const n = (Math.random() - 0.5) * 14;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(pixels, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const fold = ctx.createLinearGradient(size * 0.2, 0, size * 0.8, size);
  fold.addColorStop(0, "rgba(40,32,28,0.12)");
  fold.addColorStop(0.45, "rgba(255,255,255,0.08)");
  fold.addColorStop(1, "rgba(20,16,14,0.22)");
  ctx.fillStyle = fold;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  const print = await makePrintTextureAsync(design, view, size);
  ctx.drawImage(print, 0, 0);
  return canvas;
}

export function makeFabricNormalMap(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const wr =
        Math.sin(v * 18) * 0.35 +
        Math.sin(u * 22 + v * 9) * 0.25 +
        (Math.random() - 0.5) * 0.12;
      const i = (y * size + x) * 4;
      d[i] = 128 + wr * 40;
      d[i + 1] = 128 + wr * 28;
      d[i + 2] = 255;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
