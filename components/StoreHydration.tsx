"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/store";
import { useDispatch } from "@/lib/dispatch/store";
import { useLang } from "@/lib/i18n";
import { useShop } from "@/lib/store";

/**
 * Rehydrate zustand persist stores after mount so SSR HTML matches
 * the first client render (defaults), then apply localStorage.
 */
export function StoreHydration() {
  useEffect(() => {
    void useLang.persist.rehydrate();
    void useAuth.persist.rehydrate();
    void useShop.persist.rehydrate();
    void useDispatch.persist.rehydrate();
  }, []);

  return null;
}
