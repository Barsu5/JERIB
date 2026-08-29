"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useT, type DictKey } from "@/lib/i18n";
import type { PartDef } from "@/lib/types";

type Props = {
  zones: PartDef[];
  activeZoneId: string;
  guideV: number | null;
  guideH: number | null;
  onSelectZone: (zoneId: string) => void;
  onMoveZone: (zoneId: string, box: { left: number; top: number; width: number; height: number }) => void;
};

export function PlacementGuides({
  zones,
  activeZoneId,
  guideV,
  guideH,
  onSelectZone,
  onMoveZone,
}: Props) {
  const t = useT();
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    orig: { left: number; top: number; width: number; height: number };
  } | null>(null);

  const onPointerDown = (
    e: ReactPointerEvent,
    z: PartDef,
    mode: "move" | "resize"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectZone(z.id);
    const parent = (e.currentTarget as HTMLElement).offsetParent as HTMLElement | null;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    dragRef.current = {
      id: z.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      orig: { left: z.left, top: z.top, width: z.width, height: z.height },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ((ev.clientX - d.startX) / rect.width) * 100;
      const dy = ((ev.clientY - d.startY) / rect.height) * 100;
      if (d.mode === "move") {
        onMoveZone(d.id, {
          left: d.orig.left + dx,
          top: d.orig.top + dy,
          width: d.orig.width,
          height: d.orig.height,
        });
      } else {
        onMoveZone(d.id, {
          left: d.orig.left,
          top: d.orig.top,
          width: d.orig.width + dx,
          height: d.orig.height + dy,
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {zones.map((z) => {
        const active = z.id === activeZoneId;
        return (
          <div
            key={z.id}
            role="button"
            tabIndex={0}
            className={`absolute pointer-events-auto cursor-move border transition touch-none ${
              active
                ? "border-clay/80 bg-clay/10"
                : "border-dashed border-gold/35 bg-transparent hover:border-gold/70 hover:bg-gold/5"
            }`}
            style={{
              left: `${z.left}%`,
              top: `${z.top}%`,
              width: `${z.width}%`,
              height: `${z.height}%`,
            }}
            onPointerDown={(e) => onPointerDown(e, z, "move")}
            title={`${t(`zone_${z.id}` as DictKey)} — ${t("dragZoneHint")}`}
          >
            <span
              className={`pointer-events-none absolute left-1 top-1 text-[9px] uppercase tracking-[0.16em] ${
                active ? "text-clay" : "text-gold/80"
              }`}
            >
              {t(`zone_${z.id}` as DictKey)}
            </span>
            {active && (
              <>
                <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-clay/30" />
                <span className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-clay/30" />
                <span
                  className="absolute bottom-0 right-0 h-3.5 w-3.5 cursor-se-resize border border-clay bg-paper/90"
                  onPointerDown={(e) => onPointerDown(e, z, "resize")}
                />
              </>
            )}
          </div>
        );
      })}
      {guideV != null && (
        <span className="absolute top-0 h-full w-px bg-gold" style={{ left: `${guideV}%` }} />
      )}
      {guideH != null && (
        <span className="absolute left-0 h-px w-full bg-gold" style={{ top: `${guideH}%` }} />
      )}
    </div>
  );
}
