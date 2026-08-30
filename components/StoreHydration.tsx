"use client";

import { useEffect } from "react";
import { bootstrapApi } from "@/lib/api/bootstrap";
import { useAuth } from "@/lib/auth/store";
import { useDispatch } from "@/lib/dispatch/store";
import { useLang } from "@/lib/i18n";
import { useShop } from "@/lib/store";

/**
 * Rehydrate zustand persist stores after mount so SSR HTML matches
 * the first client render (defaults), then apply localStorage or API bootstrap.
 */
export function StoreHydration() {
  useEffect(() => {
    async function boot() {
      void useLang.persist.rehydrate();
      await bootstrapApi();

      const useApi = useAuth.getState().useApi;
      if (!useApi) {
        void useAuth.persist.rehydrate();
        void useDispatch.persist.rehydrate();
      }

      void useShop.persist.rehydrate();
    }

    void boot();
  }, []);

  return null;
}
