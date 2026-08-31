"use client";

import { useState } from "react";
import type { AiDesignStyle } from "@/lib/ai/design";
import { requestAiDesign } from "@/lib/ai/design";
import type { ProductId } from "@/lib/types";
import { useT, type DictKey } from "@/lib/i18n";

const STYLES: AiDesignStyle[] = ["emblem", "stripes", "mascot", "abstract", "number"];

const FOOTBALL_PRESETS = [
  { key: "aiPresetLion", prompt: "lion mascot football team" },
  { key: "aiPresetEagle", prompt: "eagle emblem football club" },
  { key: "aiPresetFire", prompt: "fire flame energy football" },
  { key: "aiPresetStar", prompt: "gold star champion football" },
] as const;

type Props = {
  productId: ProductId;
  onGenerated: (dataUrl: string) => void;
  onAddNumber: (num: string) => void;
  onAddName: (name: string) => void;
};

export function AiDesignPanel({ productId, onGenerated, onAddNumber, onAddName }: Props) {
  const t = useT();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<AiDesignStyle>("emblem");
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async (text?: string) => {
    setBusy(true);
    setError("");
    try {
      const image = await requestAiDesign({
        prompt: text ?? prompt,
        productId,
        style,
      });
      onGenerated(image);
    } catch {
      setError(t("aiGenerateFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-mist">{t("aiEditorHint")}</p>

      <div className="flex flex-wrap gap-1">
        {STYLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStyle(s)}
            className={`px-2 py-1 text-[10px] uppercase tracking-widest ${
              style === s ? "border border-clay text-clay" : "border border-white/15 hover:border-white/40"
            }`}
          >
            {t(`aiStyle_${s}` as DictKey)}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t("aiPromptPlaceholder")}
        className="w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-clay"
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => void generate()}
        className="w-full bg-clay py-3 text-[11px] uppercase tracking-[0.22em] text-paper disabled:opacity-50"
      >
        {busy ? t("aiGeneratingWait") : t("aiGenerate")}
      </button>

      <div className="grid grid-cols-2 gap-1">
        {FOOTBALL_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            disabled={busy}
            onClick={() => void generate(preset.prompt)}
            className="border border-white/15 px-2 py-2 text-[10px] uppercase tracking-widest hover:border-clay disabled:opacity-40"
          >
            {t(preset.key as DictKey)}
          </button>
        ))}
      </div>

      {productId.startsWith("football_") && (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{t("footballKitQuick")}</p>
          <div className="flex gap-2">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t("playerName")}
              className="flex-1 border border-white/15 bg-transparent px-2 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => playerName.trim() && onAddName(playerName.trim().toUpperCase())}
              className="border border-white/15 px-3 text-[10px] uppercase tracking-widest hover:border-clay"
            >
              {t("addName")}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={playerNumber}
              onChange={(e) => setPlayerNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="10"
              className="w-20 border border-white/15 bg-transparent px-2 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => playerNumber && onAddNumber(playerNumber)}
              className="flex-1 border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest hover:border-clay"
            >
              {t("addNumber")}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-clay">{error}</p>}
    </div>
  );
}
