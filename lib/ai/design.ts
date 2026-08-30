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

export async function requestAiDesign(input: {
  prompt: string;
  productId: ProductId;
  style: AiDesignStyle;
}): Promise<string> {
  const res = await fetch("/api/ai/design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as { image?: string; error?: string };
  if (!res.ok || !body.image) {
    throw new Error(body.error || "ai_failed");
  }
  return body.image;
}
