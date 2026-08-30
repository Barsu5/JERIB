import type { ProductId } from "@/lib/types";

export type AiDesignStyle = "emblem" | "stripes" | "mascot" | "abstract" | "number";

const STYLE_HINTS: Record<AiDesignStyle, string> = {
  emblem: "football team crest emblem, shield logo, vector style, clean edges",
  stripes: "bold diagonal stripes pattern, sports kit graphic, high contrast",
  mascot: "football mascot character, energetic pose, flat illustration",
  abstract: "dynamic abstract sports graphic, motion lines, modern print",
  number: "large bold sports jersey number graphic, typography, print ready",
};

export function buildAiPrompt(
  userPrompt: string,
  productId: ProductId,
  style: AiDesignStyle
): string {
  const productHint = productId.startsWith("football_")
    ? "football kit print design for jersey shorts or socks"
    : "custom apparel print design";
  const trimmed = userPrompt.trim() || "football team";
  return `${STYLE_HINTS[style]}, ${productHint}, ${trimmed}, isolated graphic on plain background, no mockup, no clothing photo`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(blob);
  });
}

/** Pollinations from the browser — works when server egress to Pollinations is blocked (e.g. Render). */
export async function fetchPollinationsClient(prompt: string): Promise<string> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store", mode: "cors" });
  if (!res.ok) throw new Error("pollinations_failed");

  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) throw new Error("pollinations_not_image");

  const blob = await res.blob();
  if (blob.size < 512) throw new Error("pollinations_empty");

  return blobToDataUrl(blob);
}

export async function requestAiDesign(input: {
  prompt: string;
  productId: ProductId;
  style: AiDesignStyle;
}): Promise<string> {
  const fullPrompt = buildAiPrompt(input.prompt, input.productId, input.style);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    const res = await fetch("/api/ai/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = (await res.json()) as { image?: string; error?: string };
    if (res.ok && body.image) return body.image;
  } catch {
    // Server route may fail on hosts that block Pollinations — try browser fallback.
  }

  return fetchPollinationsClient(fullPrompt);
}
