"use client";

import { useEffect, useState } from "react";

/** True only after client mount — avoids SSR/localStorage hydration mismatches */
export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
