"use client";

import { useEffect } from "react";
import { useDispatch } from "@/lib/dispatch/store";

/** Cascade expired partner offers while dashboards are open */
export function useDispatchTick(ms = 5000) {
  const tick = useDispatch((s) => s.tickDispatch);
  useEffect(() => {
    tick();
    const id = setInterval(tick, ms);
    return () => clearInterval(id);
  }, [tick, ms]);
}
