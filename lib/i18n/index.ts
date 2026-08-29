"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { de } from "./messages/de";
import { pt } from "./messages/pt";
import { ru } from "./messages/ru";

export type Lang = "en" | "es" | "fr" | "de" | "pt" | "ru";

export type DictKey = keyof typeof en;

const dict = { en, es, fr, de, pt, ru };

type LangState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
};

const VALID_LANGS = new Set<Lang>(["en", "es", "fr", "de", "pt", "ru"]);

export const useLang = create<LangState>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
      t: (key) => dict[get().lang][key] ?? dict.en[key] ?? key,
    }),
    {
      name: "jerib-lang",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state && !VALID_LANGS.has(state.lang)) state.lang = "en";
      },
    }
  )
);

export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ru", label: "RU" },
  { id: "es", label: "ES" },
  { id: "fr", label: "FR" },
  { id: "de", label: "DE" },
  { id: "pt", label: "PT" },
];

export function useT() {
  const lang = useLang((s) => s.lang);
  return (key: DictKey) => {
    const table = dict[lang] ?? dict.en;
    return table[key] ?? dict.en[key] ?? key;
  };
}
