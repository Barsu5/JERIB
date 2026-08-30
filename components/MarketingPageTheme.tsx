"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Switches body to light Printful-style theme on the marketing homepage. */
export function MarketingPageTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const onHome = pathname === "/";
    document.documentElement.classList.toggle("page-marketing", onHome);
    document.body.classList.toggle("page-marketing", onHome);
    return () => {
      document.documentElement.classList.remove("page-marketing");
      document.body.classList.remove("page-marketing");
    };
  }, [pathname]);

  return null;
}
