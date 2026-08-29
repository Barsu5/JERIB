"use client";

import { Suspense } from "react";
import LoginPage from "./LoginInner";

export default function Page() {
  return (
    <Suspense fallback={<main className="px-6 pt-40 text-mist">…</main>}>
      <LoginPage />
    </Suspense>
  );
}
