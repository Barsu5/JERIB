"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en } from "./messages/en";
import { ru } from "./messages/ru";
import { tg } from "./messages/tg";

export type Lang = "en" | "ru" | "tg";

export type DictKey = keyof typeof en;

const dict = { en, ru, tg };

type LangState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
};

const VALID_LANGS = new Set<Lang>(["en", "ru", "tg"]);

const LEGACY_LANG_MAP: Record<string, Lang> = {
  es: "en",
  fr: "en",
  de: "en",
  pt: "en",
};

export const useLang = create<LangState>()(
  persist(
    (set, get) => ({
      lang: "ru",
      setLang: (lang) => set({ lang }),
      t: (key) => dict[get().lang][key] ?? dict.en[key] ?? key,
    }),
    {
      name: "jerib-lang",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const mapped = LEGACY_LANG_MAP[state.lang as string];
        if (mapped) state.lang = mapped;
        else if (!VALID_LANGS.has(state.lang)) state.lang = "ru";
      },
    }
  )
);

export const LANGS: { id: Lang; label: string }[] = [
  { id: "ru", label: "РУ" },
  { id: "en", label: "EN" },
  { id: "tg", label: "ТҶ" },
];

export function useT() {
  const lang = useLang((s) => s.lang);
  return (key: DictKey) => {
    const table = dict[lang] ?? dict.en;
    return table[key] ?? dict.en[key] ?? key;
  };
}
