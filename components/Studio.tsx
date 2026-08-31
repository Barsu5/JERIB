"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductId } from "@/lib/types";
import { GarmentSvg } from "@/components/GarmentSvg";
import { PlacementGuides } from "@/components/PlacementGuides";
import {
  COLORS,
  CASUAL_PRODUCTS,
  FOOTBALL_PRODUCTS,
  PATTERNS,
  PRODUCTS,
  SIZES,
  SYMBOLS,
  colorById,
  productById,
} from "@/lib/catalog";
import { useT, type DictKey } from "@/lib/i18n";
import {
  alignInZone,
  clampToZone,
  snapInZone,
  suggestedScales,
  type AlignMode,
} from "@/lib/placement";
import { removeImageBackground } from "@/lib/removeBackground";
import { isSleeveZone, layerVisibleOnView, partsFor, PARTS, COLOR_KEYS } from "@/lib/parts";
import { useShop, useStudio } from "@/lib/store";
import type { DesignLayer, LayerKind } from "@/lib/types";

function PatternFill({ id, color }: { id: string; color: string }) {
  if (id === "stripes") {
    return (
      <svg viewBox="0 0 80 80" className="h-full w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={i * 10} y="0" width="5" height="80" fill={color} />
        ))}
      </svg>
    );
  }
  if (id === "grid") {
    return (
      <svg viewBox="0 0 80 80" className="h-full w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <rect x={i * 10} y="0" width="1.5" height="80" fill={color} />
            <rect x="0" y={i * 10} width="80" height="1.5" fill={color} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "wave") {
    return (
      <svg viewBox="0 0 80 80" className="h-full w-full">
        <path
          d="M0 20 Q20 0 40 20 T80 20 M0 45 Q20 25 40 45 T80 45 M0 70 Q20 50 40 70 T80 70"
          fill="none"
          stroke={color}
          strokeWidth="3"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full">
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i} cx={(i % 4) * 20 + 10} cy={Math.floor(i / 4) * 20 + 10} r="4" fill={color} />
      ))}
    </svg>
  );
}

function LayerVisual({ layer }: { layer: DesignLayer }) {
  if (layer.kind === "text") {
    return (
      <p
        className="max-w-[140px] text-center font-display text-lg leading-tight"
        style={{ color: layer.color }}
      >
        {layer.content}
      </p>
    );
  }
  if (layer.kind === "image" || layer.kind === "logo" || layer.kind === "drawing") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={layer.content} alt="" className="max-h-24 max-w-24 object-contain" />
    );
  }
  if (layer.kind === "symbol") {
    return (
      <span className="font-display text-4xl" style={{ color: layer.color }}>
        {layer.content}
      </span>
    );
  }
  return <PatternFill id={layer.content} color={layer.color} />;
}

function DrawPad({ onDone }: { onDone: (data: string) => void }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className="w-full cursor-crosshair rounded-sm bg-[#1a1816] touch-none"
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current!.getContext("2d")!;
          const p = pos(e);
          ctx.strokeStyle = "#f3eee6";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current!.getContext("2d")!;
          const p = pos(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />
      <button
        type="button"
        className="w-full border border-paper/20 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-clay hover:text-clay"
        onClick={() => onDone(canvasRef.current!.toDataURL())}
      >
        {t("placeDrawing")}
      </button>
    </div>
  );
}

export function Studio() {
  const t = useT();
  const router = useRouter();
  const search = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<LayerKind | "color" | "ai" | null>("text");
  const [text, setText] = useState("JERIB");
  const [removeBg, setRemoveBg] = useState(true);
  const [bgBusy, setBgBusy] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [guideV, setGuideV] = useState<number | null>(null);
  const [guideH, setGuideH] = useState<number | null>(null);

  const productId = useStudio((s) => s.productId);
  const colorId = useStudio((s) => s.colorId);
  const partColors = useStudio((s) => s.partColors);
  const size = useStudio((s) => s.size);
  const view = useStudio((s) => s.view);
  const placement = useStudio((s) => s.placement);
  const layers = useStudio((s) => s.layers);
  const selectedId = useStudio((s) => s.selectedId);
  const setProduct = useStudio((s) => s.setProduct);
  const setColor = useStudio((s) => s.setColor);
  const setSize = useStudio((s) => s.setSize);
  const setView = useStudio((s) => s.setView);
  const setPlacement = useStudio((s) => s.setPlacement);
  const addLayer = useStudio((s) => s.addLayer);
  const updateLayer = useStudio((s) => s.updateLayer);
  const removeLayer = useStudio((s) => s.removeLayer);
  const selectLayer = useStudio((s) => s.selectLayer);
  const resetDesign = useStudio((s) => s.resetDesign);
  const zoneLayout = useStudio((s) => s.zoneLayout);
  const moveZone = useStudio((s) => s.moveZone);
  const resetZoneLayout = useStudio((s) => s.resetZoneLayout);
  const resolvedZone = useStudio((s) => s.resolvedZone);
  const paintPart = useStudio((s) => s.paintPart);
  const selectedColorKey = useStudio((s) => s.selectedColorKey);
  const setSelectedColorKey = useStudio((s) => s.setSelectedColorKey);
  const addToCart = useShop((s) => s.addToCart);

  useEffect(() => {
    const q = search.get("product") as ProductId | null;
    if (q && PRODUCTS.some((p) => p.id === q)) setProduct(q);
  }, [search, setProduct]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeLayer(selectedId);
        return;
      }
      if (!selectedId) return;
      const layer = useStudio.getState().layers.find((l) => l.id === selectedId);
      if (!layer) return;
      const step = e.shiftKey ? 2 : 0.5;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      if (e.key === "ArrowRight") dx = step;
      if (e.key === "ArrowUp") dy = -step;
      if (e.key === "ArrowDown") dy = step;
      if (!dx && !dy) return;
      e.preventDefault();
      const zone = resolvedZone(layer.placement);
      const next = clampToZone(layer.x + dx, layer.y + dy, zone);
      updateLayer(layer.id, next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeLayer, productId, updateLayer, resolvedZone]);

  const product = productById(productId);
  const fabric = colorById(colorId);
  const selected = layers.find((l) => l.id === selectedId);
  const visibleZones = useMemo(() => {
    return partsFor(productId, view).map((z) => {
      const key = `${productId}:${z.id}`;
      const over = zoneLayout[key];
      return over ? { ...z, ...over } : z;
    });
  }, [productId, view, zoneLayout]);
  const activeZone = resolvedZone(placement);
  const visibleLayers = useMemo(
    () => layers.filter((l) => layerVisibleOnView(productId, l.placement, view)),
    [layers, productId, view]
  );
  const hasSleeves = useMemo(
    () => PARTS[productId].some((z) => isSleeveZone(z.id)),
    [productId]
  );

  /** Clicking a zone only chooses where NEW marks go — does not move the selected mark */
  const selectZone = (zoneId: string) => {
    setPlacement(zoneId);
  };

  const alignSelected = (mode: AlignMode) => {
    if (!selected) return;
    const zone = resolvedZone(selected.placement);
    updateLayer(selected.id, alignInZone(mode, zone));
  };

  const onFile = (kind: "image" | "logo") => {
    const input = fileRef.current;
    if (!input) return;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBgError(false);
      try {
        if (removeBg) {
          setBgBusy(true);
          const dataUrl = await removeImageBackground(file);
          addLayer(kind, dataUrl);
        } else {
          const reader = new FileReader();
          reader.onload = () => addLayer(kind, String(reader.result));
          reader.readAsDataURL(file);
        }
      } catch {
        setBgError(true);
        const reader = new FileReader();
        reader.onload = () => addLayer(kind, String(reader.result));
        reader.readAsDataURL(file);
      } finally {
        setBgBusy(false);
        input.value = "";
      }
    };
    input.click();
  };

  const removeBgFromSelected = async () => {
    if (!selected || (selected.kind !== "image" && selected.kind !== "logo" && selected.kind !== "drawing")) {
      return;
    }
    if (!selected.content.startsWith("data:image") && !selected.content.startsWith("blob:")) {
      return;
    }
    setBgError(false);
    setBgBusy(true);
    try {
      const dataUrl = await removeImageBackground(selected.content);
      updateLayer(selected.id, { content: dataUrl });
    } catch {
      setBgError(true);
    } finally {
      setBgBusy(false);
    }
  };

  const addToBag = () => {
    addToCart({
      productId,
      colorId,
      partColors,
      size,
      layers,
      qty: 1,
    });
    router.push("/look");
  };

  const renderProductButton = (id: ProductId) => (
    <li key={id} className="shrink-0">
      <button
        type="button"
        onClick={() => setProduct(id)}
        className={`w-full px-3 py-3 text-left text-sm ${
          productId === id ? "bg-paper text-ink" : "hover:bg-white/5"
        }`}
      >
        <span className="block font-display text-lg">{t(`product_${id}` as DictKey)}</span>
      </button>
    </li>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 pt-16 lg:grid-cols-[240px_1fr_300px]">
      <aside className="order-2 border-b border-white/10 px-6 py-8 lg:order-1 lg:border-b-0 lg:border-r lg:py-10">
        <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-mist">{t("chooseProduct")}</p>
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {CASUAL_PRODUCTS.map((id) => renderProductButton(id))}
        </ul>
        <p className="mb-2 mt-6 text-[10px] uppercase tracking-[0.28em] text-clay">{t("footballSection")}</p>
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {FOOTBALL_PRODUCTS.map((id) => renderProductButton(id))}
        </ul>
      </aside>

      <section className="relative order-1 flex flex-col items-center px-6 py-8 lg:order-2 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.22em] sm:gap-6">
          <button
            type="button"
            onClick={() => setView("front")}
            className={view === "front" ? "text-clay" : "text-mist hover:text-paper"}
          >
            {t("front")}
          </button>
          {hasSleeves && (
            <>
              <span className="text-mist">↔</span>
              <button
                type="button"
                onClick={() => setView("sleeves")}
                className={view === "sleeves" ? "text-clay" : "text-mist hover:text-paper"}
              >
                {t("sleeves")}
              </button>
            </>
          )}
          <span className="text-mist">↔</span>
          <button
            type="button"
            onClick={() => setView("back")}
            className={view === "back" ? "text-clay" : "text-mist hover:text-paper"}
          >
            {t("back")}
          </button>
        </div>

        <div
          ref={previewRef}
          className="relative h-[min(72vh,620px)] w-full max-w-[520px]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-clay/10 blur-3xl" />
          <GarmentSvg product={productId} color={fabric.hex} partColors={partColors} view={view} />

          {showGuides && (
            <PlacementGuides
              zones={visibleZones}
              activeZoneId={placement}
              guideV={guideV}
              guideH={guideH}
              onSelectZone={selectZone}
              onMoveZone={(id, box) => moveZone(id, box, true)}
            />
          )}

          {visibleLayers.map((layer) => (
              <div
                key={layer.id}
                className={`absolute z-20 flex cursor-grab items-center justify-center ${
                  selectedId === layer.id ? "ring-1 ring-clay" : ""
                }`}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  selectLayer(layer.id);
                  const rect = previewRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const zone = resolvedZone(layer.placement);
                  const move = (ev: PointerEvent) => {
                    let x = ((ev.clientX - rect.left) / rect.width) * 100;
                    let y = ((ev.clientY - rect.top) / rect.height) * 100;
                    // Keep mark inside its own zone — clicking/dragging must not jump to another grid
                    const clamped = clampToZone(x, y, zone);
                    if (snapEnabled) {
                      const snapped = snapInZone(clamped.x, clamped.y, zone);
                      setGuideV(snapped.guideV);
                      setGuideH(snapped.guideH);
                      updateLayer(layer.id, { x: snapped.x, y: snapped.y });
                    } else {
                      setGuideV(null);
                      setGuideH(null);
                      updateLayer(layer.id, { x: clamped.x, y: clamped.y });
                    }
                  };
                  const up = () => {
                    setGuideV(null);
                    setGuideH(null);
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("pointerup", up);
                  };
                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                }}
              >
                <LayerVisual layer={layer} />
                {selectedId === layer.id && (
                  <>
                    <button
                      type="button"
                      aria-label={t("delete")}
                      className="absolute -right-1 -top-1 z-30 flex h-3.5 w-3.5 items-center justify-center bg-clay text-[8px] leading-none text-paper"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                    >
                      ×
                    </button>
                    {/* Bottom handle — move / scale lower edge */}
                    <span
                      className="absolute -bottom-2 left-1/2 z-30 h-3 w-8 -translate-x-1/2 cursor-ns-resize border border-gold bg-ink"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        selectLayer(layer.id);
                        const startY = e.clientY;
                        const startScale = layer.scale;
                        const startPosY = layer.y;
                        const move = (ev: PointerEvent) => {
                          const dy = ev.clientY - startY;
                          if (e.shiftKey) {
                            const nextScale = Math.min(2, Math.max(0.35, startScale + dy * 0.008));
                            updateLayer(layer.id, { scale: nextScale });
                          } else {
                            const zone = resolvedZone(layer.placement);
                            const next = clampToZone(layer.x, startPosY + dy * 0.12, zone);
                            updateLayer(layer.id, { y: next.y });
                          }
                        };
                        const up = () => {
                          window.removeEventListener("pointermove", move);
                          window.removeEventListener("pointerup", up);
                        };
                        window.addEventListener("pointermove", move);
                        window.addEventListener("pointerup", up);
                      }}
                      title={t("bottomHandleHint")}
                    />
                  </>
                )}
              </div>
            ))}
        </div>

        <p className="mt-8 max-w-md text-center text-sm text-mist">
          {t(`blurb_${productId}` as DictKey)}
        </p>
      </section>

      <aside className="order-3 space-y-8 border-t border-white/10 px-6 py-8 lg:border-l lg:border-t-0 lg:py-10">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-mist">{t("color")}</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={t(`color_${c.id}` as DictKey)}
                onClick={() => setColor(c.id)}
                className={`h-8 w-8 rounded-full border ${
                  colorId === c.id ? "border-clay ring-2 ring-clay/40" : "border-white/20"
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-mist">{t(`color_${fabric.id}` as DictKey)}</p>
          {COLOR_KEYS[productId].length > 1 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-mist">{t("kitColors")}</p>
              {COLOR_KEYS[productId].map((part) => (
                <label key={part.id} className="flex items-center gap-2 text-xs text-mist">
                  <input
                    type="color"
                    value={partColors[part.id] ?? fabric.hex}
                    onChange={(e) => {
                      setSelectedColorKey(part.id);
                      paintPart(e.target.value);
                    }}
                    className="h-8 w-10 bg-transparent"
                  />
                  {t(`colorPart_${part.id}` as DictKey)}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-mist">{t("printOn")}</p>
          <div className="flex flex-wrap gap-1">
            {visibleZones.map((zone) => {
              const label = t(`zone_${zone.id}` as DictKey);
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => selectZone(zone.id)}
                  className={`px-2 py-1 text-[10px] uppercase tracking-widest ${
                    placement === zone.id ? "border border-clay text-clay" : "border border-white/15 hover:border-white/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-mist">{t("placementTool")}</p>
          <p className="mb-3 text-xs leading-relaxed text-mist">{t("placementToolHint")}</p>
          <p className="mb-3 text-xs leading-relaxed text-mist/80">{t("dragZoneHint")}</p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-mist">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="accent-clay"
              />
              {t("showGuides")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-mist">
              <input
                type="checkbox"
                checked={snapEnabled}
                onChange={(e) => setSnapEnabled(e.target.checked)}
                className="accent-clay"
              />
              {t("snapToZone")}
            </label>
            <button
              type="button"
              onClick={() => resetZoneLayout()}
              className="text-[10px] uppercase tracking-[0.16em] text-mist hover:text-clay"
            >
              {t("resetZones")}
            </button>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-mist">{t("alignInZone")}</p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <span />
            <button
              type="button"
              disabled={!selected}
              onClick={() => alignSelected("top")}
              className="border border-white/15 px-2 py-2 text-[10px] uppercase tracking-widest disabled:opacity-30 hover:border-gold"
            >
              {t("alignTop")}
            </button>
            <span />
            <button
              type="button"
              disabled={!selected}
              onClick={() => alignSelected("left")}
              className="border border-white/15 px-2 py-2 text-[10px] uppercase tracking-widest disabled:opacity-30 hover:border-gold"
            >
              {t("alignLeft")}
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => alignSelected("center")}
              className="border border-clay/50 px-2 py-2 text-[10px] uppercase tracking-widest text-clay disabled:opacity-30 hover:border-clay"
            >
              {t("alignCenter")}
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => alignSelected("right")}
              className="border border-white/15 px-2 py-2 text-[10px] uppercase tracking-widest disabled:opacity-30 hover:border-gold"
            >
              {t("alignRight")}
            </button>
            <span />
            <button
              type="button"
              disabled={!selected}
              onClick={() => alignSelected("bottom")}
              className="border border-gold/50 px-2 py-2 text-[10px] uppercase tracking-widest text-gold disabled:opacity-30 hover:border-gold"
            >
              {t("alignBottom")}
            </button>
            <span />
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-mist">{t("printSize")}</p>
          <div className="mt-2 flex gap-1">
            {suggestedScales(activeZone).map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={!selected}
                onClick={() => selected && updateLayer(selected.id, { scale: s.scale })}
                className="min-w-10 border border-white/15 px-3 py-2 text-xs disabled:opacity-30 hover:border-gold"
              >
                {s.id}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-mist">{t("nudgeHint")}</p>
        </div>

        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-mist">{t("customize")}</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.16em]">
            {(
              [
                ["text", "addText"],
                ["logo", "logo"],
                ["image", "image"],
                ["pattern", "pattern"],
                ["symbol", "symbol"],
                ["drawing", "drawing"],
              ] as const
            ).map(([id, key]) => (
              <button
                key={id}
                type="button"
                disabled={bgBusy}
                onClick={() => {
                  setTool(id);
                  if (id === "image" || id === "logo") onFile(id);
                }}
                className={`border px-2 py-2 disabled:opacity-40 ${tool === id ? "border-clay text-clay" : "border-white/15 hover:border-white/40"}`}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-mist">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={(e) => setRemoveBg(e.target.checked)}
              className="accent-clay"
            />
            {t("removeBgOnUpload")}
          </label>
          {bgBusy && <p className="mt-2 text-xs text-gold">{t("removingBg")}</p>}
          {bgError && <p className="mt-2 text-xs text-clay">{t("bgRemoveFailed")}</p>}
        </div>

        {tool === "text" && (
          <div className="space-y-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-clay"
            />
            <button
              type="button"
              className="text-[11px] uppercase tracking-[0.2em] text-clay"
              onClick={() => addLayer("text", text || "JERIB")}
            >
              {t("placeText")} {t(`zone_${placement}` as DictKey)}
            </button>
          </div>
        )}

        {tool === "pattern" && (
          <div className="grid grid-cols-2 gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addLayer("pattern", p.id, fabric.id === "white" ? "#141414" : "#f3eee6")}
                className="border border-white/15 p-2 text-[10px] uppercase tracking-widest hover:border-clay"
              >
                {t(`pattern_${p.id}` as DictKey)}
              </button>
            ))}
          </div>
        )}

        {tool === "symbol" && (
          <div className="flex flex-wrap gap-2 text-2xl">
            {SYMBOLS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addLayer("symbol", s)}
                className="h-10 w-10 border border-white/15 hover:border-clay"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {tool === "drawing" && <DrawPad onDone={(data) => addLayer("drawing", data)} />}

        {layers.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-mist">{t("marks")}</p>
              <button
                type="button"
                onClick={resetDesign}
                className="text-[10px] uppercase tracking-[0.18em] text-mist hover:text-clay"
              >
                {t("deleteAll")}
              </button>
            </div>
            <ul className="space-y-1">
              {layers.map((layer) => (
                <li
                  key={layer.id}
                  className={`flex items-center justify-between gap-2 border px-2 py-2 text-xs ${
                    selectedId === layer.id ? "border-clay" : "border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left"
                    onClick={() => selectLayer(layer.id)}
                  >
                    {layer.kind} · {t(`zone_${layer.placement}` as DictKey)}
                    {layer.kind === "text" || layer.kind === "symbol" ? ` · ${layer.content}` : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLayer(layer.id)}
                    className="shrink-0 text-[10px] uppercase tracking-widest text-mist hover:text-clay"
                  >
                    {t("delete")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selected && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-mist">{t("selectedMark")}</p>
            <label className="block text-[10px] uppercase tracking-widest text-mist">
              {t("size")}
              <input
                type="range"
                min={0.4}
                max={2}
                step={0.05}
                value={selected.scale}
                onChange={(e) => updateLayer(selected.id, { scale: Number(e.target.value) })}
                className="mt-1 w-full"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-widest text-mist">
              {t("rotate")}
              <input
                type="range"
                min={-40}
                max={40}
                step={1}
                value={selected.rotation}
                onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
                className="mt-1 w-full"
              />
            </label>
            {(selected.kind === "text" || selected.kind === "symbol" || selected.kind === "pattern") && (
              <input
                type="color"
                value={selected.color}
                onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                className="h-8 w-full bg-transparent"
              />
            )}
            {(selected.kind === "image" || selected.kind === "logo" || selected.kind === "drawing") && (
              <button
                type="button"
                disabled={bgBusy}
                onClick={removeBgFromSelected}
                className="w-full border border-gold/40 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-gold hover:border-clay hover:text-clay disabled:opacity-40"
              >
                {bgBusy ? t("removingBg") : t("removeBg")}
              </button>
            )}
            <button
              type="button"
              onClick={() => removeLayer(selected.id)}
              className="text-[11px] uppercase tracking-[0.2em] text-mist hover:text-clay"
            >
              {t("remove")}
            </button>
          </div>
        )}

        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-mist">{t("size")}</p>
          <div className="flex flex-wrap gap-1">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-10 px-2 py-2 text-xs ${size === s ? "bg-paper text-ink" : "border border-white/15 hover:border-white/40"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={addToBag}
          className="w-full bg-paper py-4 text-[11px] uppercase tracking-[0.28em] text-ink hover:bg-clay hover:text-paper"
        >
          {t("finishResult")}
        </button>
        <p className="text-[11px] leading-relaxed text-mist">{t("produceNote")}</p>
      </aside>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-hidden="true" tabIndex={-1} />
    </div>
  );
}
