"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n";

/** Keeps <html lang> in sync with the chosen UI language. */
export function LangAttr() {
  const lang = useLang((s) => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
