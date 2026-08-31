import type { ProductId } from "@/lib/types";

export type AiDesignStyle = "emblem" | "stripes" | "mascot" | "abstract" | "number";

const STYLE_SHORT: Record<AiDesignStyle, string> = {
  emblem: "team crest emblem",
  stripes: "diagonal stripes",
  mascot: "sports mascot",
  abstract: "abstract sports graphic",
  number: "jersey number",
};

/** Compact prompt — shorter URL, faster Pollinations response. */
export function buildAiPrompt(
  userPrompt: string,
  productId: ProductId,
  style: AiDesignStyle
): string {
  const hint = STYLE_SHORT[style];
  const subject = userPrompt.trim() || "football team";
  const garment = productId.startsWith("football_") ? "football kit" : "t-shirt print";
  return `${hint}, ${subject}, ${garment}, flat vector, white background, no mockup`;
}

function pollinationsUrl(prompt: string) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(blob);
  });
}

/** Load cross-origin image into canvas — works when fetch headers are restricted. */
function imageUrlToDataUrl(url: string, timeoutMs = 90_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const w = img.naturalWidth || 512;
        const h = img.naturalHeight || 512;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("img_load_failed"));
    };
    img.src = url;
  });
}

/** Pollinations from the browser — primary path (fast, works on Render). */
export async function fetchPollinationsClient(prompt: string): Promise<string> {
  const url = pollinationsUrl(prompt);

  try {
    return await imageUrlToDataUrl(url);
  } catch {
    const res = await fetch(url, {
      cache: "no-store",
      mode: "cors",
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) throw new Error("pollinations_failed");
    const blob = await res.blob();
    if (blob.size < 256) throw new Error("pollinations_empty");
    return blobToDataUrl(blob);
  }
}

export async function requestAiDesign(input: {
  prompt: string;
  productId: ProductId;
  style: AiDesignStyle;
}): Promise<string> {
  const fullPrompt = buildAiPrompt(input.prompt, input.productId, input.style);

  // Client-first: instant start, no wait for server on Render.
  try {
    return await fetchPollinationsClient(fullPrompt);
  } catch {
    // Optional OpenAI path via server when OPENAI_API_KEY is set.
    const res = await fetch("/api/ai/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(60_000),
    });
    const body = (await res.json()) as { image?: string };
    if (body.image) return body.image;
    throw new Error("ai_failed");
  }
}
