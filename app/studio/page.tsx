import { Suspense } from "react";
import { Studio } from "@/components/Studio";

export default function StudioPage() {
  return (
    <main className="bg-ink">
      <Suspense fallback={<div className="min-h-screen" />}>
        <Studio />
      </Suspense>
    </main>
  );
}
