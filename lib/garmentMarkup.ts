import type { ProductId, View } from "./types";

function shade(hex: string, amt: number) {
  const n = hex.replace("#", "");
  const num = parseInt(n.length === 3 ? n.split("").map((c) => c + c).join("") : n, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const TEE =
  "M180 86 C198 86 214 102 217 124 L238 94 C272 116 306 146 314 174 C316 181 306 186 298 183 L270 190 C264 248 258 312 252 356 C250 372 110 372 108 356 C102 312 96 248 90 190 L62 183 C54 186 44 181 46 174 C54 146 88 116 122 94 L143 124 C146 102 162 86 180 86 Z";

const SWEAT =
  "M180 84 C200 84 218 102 220 126 L246 90 C286 114 326 150 334 182 C336 190 324 196 314 192 L278 200 C272 258 264 322 256 362 C254 378 106 378 104 362 C96 322 88 258 82 200 L46 192 C36 196 24 190 26 182 C34 150 74 114 114 90 L140 126 C142 102 160 84 180 84 Z";

export function garmentSvgMarkup(
  product: ProductId,
  color: string,
  view: View,
  partColors?: Record<string, string>
) {
  const pick = (key: string, fallback = color) => partColors?.[key] ?? fallback;
  const light = shade(color, 36);
  const dark = shade(color, -38);
  const stitch = shade(color, 42);
  const hoodie = product === "hoodie";
  const sweat = product === "sweatshirt" || hoodie;
  const body = sweat ? SWEAT : TEE;

  if (product === "football_jersey") {
    const bodyColor = pick("body");
    const sleeveColor = pick("sleeves", shade(bodyColor, -20));
    const collarColor = pick("collar", shade(bodyColor, 30));
    const bodyPath =
      "M180 78 C198 78 212 92 214 110 L236 82 C268 104 302 132 310 158 C312 166 302 170 294 168 L268 176 C262 230 256 290 252 334 C250 350 110 350 108 334 C104 290 98 230 92 176 L66 168 C58 170 48 166 50 158 C58 132 92 104 124 82 L146 110 C148 92 162 78 180 78 Z";
    const sleeves =
      view === "front" || view === "sleeves"
        ? `<path d="M50 158 L92 176 L108 134 L124 82 L92 104 Z" fill="${sleeveColor}"/>
           <path d="M310 158 L268 176 L252 134 L236 82 L268 104 Z" fill="${sleeveColor}"/>`
        : "";
    const collar =
      view === "front"
        ? `<path d="M152 112 C162 138 198 138 208 112 L198 104 C188 118 172 118 162 104 Z" fill="${collarColor}"/>`
        : "";
    const stripes =
      view === "back"
        ? `<rect x="168" y="200" width="24" height="120" fill="${shade(bodyColor, -12)}" opacity="0.35"/>`
        : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420">
      ${sleeves}
      <path d="${bodyPath}" fill="${bodyColor}"/>
      ${collar}
      ${stripes}
      <path d="${bodyPath}" fill="url(#clothLit)" opacity="0.4"/>
      <defs>
        <linearGradient id="clothLit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${shade(bodyColor, 36)}" stop-opacity="0.22"/>
          <stop offset="1" stop-color="${shade(bodyColor, -38)}" stop-opacity="0.28"/>
        </linearGradient>
      </defs>
    </svg>`;
  }

  if (product === "football_shorts") {
    const bodyColor = pick("body");
    const inner =
      view === "front"
        ? `<path d="M118 48 C150 44 210 44 242 48 L258 88 C264 180 268 260 270 320 C268 336 198 336 196 320 C188 220 176 160 180 148 C184 160 172 220 164 320 C162 336 92 336 90 320 C92 260 96 180 102 88 Z" fill="${bodyColor}"/>
           <path d="M180 148 V320" stroke="${shade(bodyColor, -30)}" stroke-width="2"/>`
        : `<path d="M118 48 C150 44 210 44 242 48 L258 88 C264 180 268 260 270 320 C268 336 198 336 196 320 C188 220 176 160 180 148 C184 160 172 220 164 320 C162 336 92 336 90 320 C92 260 96 180 102 88 Z" fill="${bodyColor}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420">${inner}</svg>`;
  }

  if (product === "cap") {
    const inner =
      view === "front"
        ? `<path d="M70 148 C72 86 112 44 160 44 C208 44 248 86 250 148 C248 158 200 150 160 150 C120 150 72 158 70 148 Z" fill="${color}"/>
           <path d="M74 152 C118 196 202 196 246 152 C214 174 106 174 74 152 Z" fill="${dark}"/>
           <path d="M160 44 C168 90 172 130 168 150" fill="none" stroke="${stitch}" stroke-width="1.2" opacity="0.35"/>`
        : `<path d="M70 148 C72 86 112 44 160 44 C208 44 248 86 250 148 C248 156 210 148 160 148 C110 148 72 156 70 148 Z" fill="${color}"/>
           <rect x="146" y="116" width="28" height="18" rx="4" fill="${dark}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280">${inner}</svg>`;
  }

  if (product === "pants") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 420">
      <path d="M118 38 C150 34 170 34 202 38 L224 72 C236 210 250 320 252 378 C250 388 198 388 196 376 C180 250 168 180 160 168 C152 180 140 250 124 376 C122 388 70 388 68 378 C70 320 84 210 96 72 Z" fill="${color}"/>
      <path d="M160 70 C160 120 160 160 160 168" stroke="${dark}" stroke-width="3" fill="none"/>
      ${
        view === "front"
          ? `<path d="M122 78 H150 V116 H122 Z" fill="none" stroke="${stitch}" stroke-width="1.4" opacity="0.5"/>
             <path d="M170 78 H198 V116 H170 Z" fill="none" stroke="${stitch}" stroke-width="1.4" opacity="0.5"/>`
          : ""
      }
    </svg>`;
  }

  const hood =
    hoodie && view === "front"
      ? `<path d="M122 92 C124 42 236 42 238 92 C230 112 200 104 180 104 C160 104 130 112 122 92 Z" fill="${dark}"/>`
      : hoodie
        ? `<path d="M124 94 C136 44 224 44 236 94 L226 126 H134 Z" fill="${dark}"/>`
        : "";
  const neck =
    view === "front"
      ? `<path d="${sweat ? "M148 126 C160 154 200 154 212 126" : "M150 124 C162 152 198 152 210 124"}" fill="none" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>`
      : `<path d="M180 130 V338" stroke="${stitch}" stroke-width="1.3" opacity="0.35"/>`;
  const pocket =
    hoodie && view === "front"
      ? `<rect x="150" y="250" width="60" height="66" rx="6" fill="none" stroke="${stitch}" stroke-width="1.5" opacity="0.5"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420">
    <defs>
      <linearGradient id="clothLit" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${light}" stop-opacity="0.22"/>
        <stop offset="0.45" stop-color="${color}" stop-opacity="0"/>
        <stop offset="1" stop-color="${dark}" stop-opacity="0.28"/>
      </linearGradient>
    </defs>
    ${hood}
    <path d="${body}" fill="${color}"/>
    <path d="${body}" fill="url(#clothLit)"/>
    ${neck}
    ${pocket}
  </svg>`;
}

export function svgToImage(markup: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("svg"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
}
