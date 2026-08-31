import { NextResponse } from "next/server";
import { z } from "zod";
import { buildAiPrompt, type AiDesignStyle } from "@/lib/ai/design";

const schema = z.object({
  prompt: z.string().trim().max(400),
  productId: z.string().min(1),
  style: z.enum(["emblem", "stripes", "mascot", "abstract", "number"]),
});

async function fetchOpenAi(prompt: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-2",
      prompt,
      size: "512x512",
      response_format: "b64_json",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) return null;
  return `data:image/png;base64,${b64}`;
}

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const { prompt, productId, style } = parsed.data;
    const fullPrompt = buildAiPrompt(prompt, productId as never, style as AiDesignStyle);

    const openAi = await fetchOpenAi(fullPrompt);
    if (openAi) return NextResponse.json({ image: openAi });

    return NextResponse.json({ useClient: true, prompt: fullPrompt }, { status: 503 });
  } catch (e) {
    console.error("ai design error:", e);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
}
