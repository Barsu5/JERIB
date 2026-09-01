"use client";

import { useT } from "@/lib/i18n";

/** Shown only in local dev — reminds to use localhost for instant previews. */
export function DevPreviewBar() {
  if (process.env.NODE_ENV !== "development") return null;

  const t = useT();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-clay/40 bg-clay/95 py-1.5 text-center text-[10px] uppercase tracking-[0.2em] text-white"
      role="status"
    >
      {t("devPreviewHint")}
    </div>
  );
}
