"use client";

import { useEffect, useState } from "react";
import {
  ADAMS_COORDS,
  EPOCHS,
  PIGMENTS,
  jitterCoord,
  randFloat,
  randHex,
  randInt,
} from "./coords";

type Bbox = {
  id: string;
  x: number; // % left
  y: number; // % top
  w: number; // % width
  h: number; // % height
  label: string;
  conf: string;
  formField: string;
};

type Highlight = {
  id: string;
  cx: number; // % center
  cy: number; // % center
  r: number; // % radius (along x)
  label: string;
  conf: string;
};

const BBOX_LABELS = [
  { label: "PIGMENT_LAYER", formField: "→ §2.4 PAINT_COLORS" },
  { label: "GLYPH_FRAGMENT", formField: "→ §2.1 IDEA" },
  { label: "WALL_SURFACE", formField: "→ §2.3 SCALE" },
  { label: "MARK_PERSISTENCE", formField: "→ §2.2 SKETCH" },
  { label: "SUBSTRATE_DRIFT", formField: "→ §2.5 MATERIAL" },
  { label: "CHRONO_TAG", formField: "→ §2.6 WHEN" },
];

const HIGHLIGHT_LABELS = ["ROI_01", "ROI_02", "ROI_03"];

function genBbox(i: number): Bbox {
  const w = randInt(14, 26);
  const h = randInt(14, 26);
  const x = randInt(4, 96 - w);
  const y = randInt(8, 80 - h);
  const tag = BBOX_LABELS[i % BBOX_LABELS.length];
  return {
    id: `B-${String(randInt(100, 999))}`,
    x,
    y,
    w,
    h,
    label: tag.label,
    conf: randFloat(0.62, 0.97, 2),
    formField: tag.formField,
  };
}

function genHighlight(i: number): Highlight {
  return {
    id: `H-${String(randInt(100, 999))}`,
    cx: randInt(15, 85),
    cy: randInt(20, 78),
    r: randInt(8, 16),
    label: HIGHLIGHT_LABELS[i % HIGHLIGHT_LABELS.length],
    conf: randFloat(0.6, 0.99, 2),
  };
}

export function CVOverlay() {
  // Start empty so server-rendered HTML is deterministic; populate on mount.
  const [bboxes, setBboxes] = useState<Bbox[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [tick, setTick] = useState(0);
  const [epoch, setEpoch] = useState(EPOCHS[0]);
  const [pigment, setPigment] = useState(PIGMENTS[0]);
  const [hashId, setHashId] = useState("");
  const [entropy, setEntropy] = useState("0.500");
  const [latLon, setLatLon] = useState({
    lat: ADAMS_COORDS.lat.toFixed(5),
    lon: ADAMS_COORDS.lon.toFixed(5),
  });

  // detector "re-runs" — bboxes + highlights snap to new positions
  useEffect(() => {
    setBboxes(Array.from({ length: 4 }, (_, idx) => genBbox(idx)));
    setHighlights(Array.from({ length: 3 }, (_, idx) => genHighlight(idx)));
    const i = setInterval(() => {
      setBboxes((prev) => prev.map((_, idx) => genBbox(idx)));
      setHighlights((prev) => prev.map((_, idx) => genHighlight(idx)));
    }, 3000);
    return () => clearInterval(i);
  }, []);

  // text counters tick faster
  useEffect(() => {
    const i = setInterval(() => {
      setTick((t) => (t + 1) % 1_000_000);
      setEpoch(EPOCHS[randInt(0, EPOCHS.length)]);
      setPigment(PIGMENTS[randInt(0, PIGMENTS.length)]);
      setHashId(`0x${randHex(8)}`);
      setLatLon({
        lat: jitterCoord(ADAMS_COORDS.lat, 0.0008),
        lon: jitterCoord(ADAMS_COORDS.lon, 0.0008),
      });
      setEntropy(randFloat(0.32, 0.91, 3));
    }, 480);
    return () => clearInterval(i);
  }, []);

  // points connecting detections (bbox centers + highlight centers)
  const points = [
    ...bboxes.map((b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })),
    ...highlights.map((h) => ({ x: h.cx, y: h.cy })),
  ];

  // build a polyline through nearest-neighbor for a "graph" feel
  const orderedPoints: { x: number; y: number }[] = [];
  if (points.length) {
    const remaining = [...points];
    let curr = remaining.shift()!;
    orderedPoints.push(curr);
    while (remaining.length) {
      let bestIdx = 0;
      let bestDist = Infinity;
      remaining.forEach((p, i) => {
        const d = (p.x - curr.x) ** 2 + (p.y - curr.y) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      curr = remaining.splice(bestIdx, 1)[0];
      orderedPoints.push(curr);
    }
  }
  const polyPath = orderedPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="pointer-events-none absolute inset-0 z-10 font-bit text-[12px] tabular text-ink">
      {/* SVG layer for boxes + highlights + connectors (snaps with detections) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* connector graph */}
        {polyPath && (
          <path
            d={polyPath}
            fill="none"
            stroke="#ff1500"
            strokeWidth="0.25"
            strokeDasharray="0.6 0.4"
            opacity="0.85"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {/* connector node dots */}
        {orderedPoints.map((p, i) => (
          <g key={`pt-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r="0.6"
              fill="#ff1500"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r="1.6"
              fill="none"
              stroke="#ff1500"
              strokeWidth="0.2"
              opacity="0.6"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* highlight circles */}
        {highlights.map((h, idx) => (
          <g key={`hl-${idx}`}>
            <circle
              cx={h.cx}
              cy={h.cy}
              r={h.r}
              fill="none"
              stroke="#ff1500"
              strokeWidth="0.22"
              strokeDasharray="0.9 0.6"
              opacity="0.9"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={h.cx}
              cy={h.cy}
              r={h.r * 0.55}
              fill="none"
              stroke="#050505"
              strokeWidth="0.18"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={h.cx - 1.5}
              y1={h.cy}
              x2={h.cx + 1.5}
              y2={h.cy}
              stroke="#050505"
              strokeWidth="0.22"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={h.cx}
              y1={h.cy - 1.5}
              x2={h.cx}
              y2={h.cy + 1.5}
              stroke="#050505"
              strokeWidth="0.22"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* bounding boxes */}
        {bboxes.map((b, idx) => (
          <g key={`bb-${idx}`}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill="none"
              stroke="#050505"
              strokeWidth="0.22"
              vectorEffect="non-scaling-stroke"
            />
            {[
              [b.x, b.y, b.x + 1.4, b.y, b.x, b.y + 1.4],
              [b.x + b.w, b.y, b.x + b.w - 1.4, b.y, b.x + b.w, b.y + 1.4],
              [b.x, b.y + b.h, b.x + 1.4, b.y + b.h, b.x, b.y + b.h - 1.4],
              [
                b.x + b.w,
                b.y + b.h,
                b.x + b.w - 1.4,
                b.y + b.h,
                b.x + b.w,
                b.y + b.h - 1.4,
              ],
            ].map((c, j) => (
              <g key={j}>
                <line
                  x1={c[0]}
                  y1={c[1]}
                  x2={c[2]}
                  y2={c[3]}
                  stroke="#ff1500"
                  strokeWidth="0.45"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={c[0]}
                  y1={c[1]}
                  x2={c[4]}
                  y2={c[5]}
                  stroke="#ff1500"
                  strokeWidth="0.45"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* HTML labels over bboxes (re-position each detection cycle) */}
      {bboxes.map((b, idx) => (
        <div
          key={`l-${idx}`}
          className="absolute"
          style={{
            left: `${Math.min(b.x + b.w, 80)}%`,
            top: `${b.y}%`,
            transform: "translate(4px, -100%)",
          }}
        >
          <div className="bg-ink px-1.5 py-[1px] text-[11px] uppercase tracking-wide text-bg whitespace-nowrap">
            {b.id} :: {b.label}
          </div>
          <div className="text-[10px] text-ink/85 whitespace-nowrap mt-[1px] bg-bg/70 px-1">
            conf={b.conf}
          </div>
          <div className="text-[10px] text-red whitespace-nowrap mt-[1px] bg-bg/70 px-1">
            {b.formField}
          </div>
        </div>
      ))}

      {/* highlight labels */}
      {highlights.map((h, idx) => (
        <div
          key={`hl-l-${idx}`}
          className="absolute font-bit"
          style={{
            left: `${Math.min(h.cx + h.r + 1, 86)}%`,
            top: `${h.cy}%`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="text-[11px] text-ink bg-bg/70 px-1">
            {h.label} ▸ {h.conf}
          </div>
        </div>
      ))}

      {/* TOP-LEFT: REC + epoch + sample id */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 bg-bg/70 px-2 py-1">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="pulse-dot" />
          <span className="font-bit tracking-widest">REC</span>
          <span className="text-ink/60">|</span>
          <span className="text-ink/80">SAMPLE_ID {hashId || "0x00000000"}</span>
        </div>
        <div className="text-[11px] text-ink/80 font-bit">
          EPOCH_CLASSIFIER → {epoch}
        </div>
        <div className="text-[11px] text-ink/80 font-bit">
          PIGMENT_DETECT → {pigment}
        </div>
      </div>

      {/* TOP-RIGHT: coords */}
      <div className="absolute top-3 right-3 text-right bg-bg/70 px-2 py-1">
        <div className="text-[12px] font-bit">N {latLon.lat}°</div>
        <div className="text-[12px] font-bit">
          W {Math.abs(parseFloat(latLon.lon)).toFixed(5)}°
        </div>
        <div className="text-[10px] text-ink/60">ADAMS_HOUSE / TUNNEL_LVL_-1</div>
      </div>

      {/* BOTTOM-LEFT: process line */}
      <div className="absolute bottom-3 left-3 text-[11px] font-bit text-ink/85 bg-bg/70 px-2 py-1">
        ⏵ frame {String(tick).padStart(6, "0")} / 138s loop / detect_rate=0.33Hz
      </div>

      {/* BOTTOM-RIGHT: counters */}
      <div className="absolute bottom-3 right-3 text-right text-[11px] font-bit text-ink/85 bg-bg/70 px-2 py-1">
        <div>
          BBOX {bboxes.length} / ROI {highlights.length}
        </div>
        <div>ENTROPY {entropy}</div>
        <div>SIG {(((tick * 13) % 999) / 100).toFixed(2)}σ</div>
      </div>

      {/* connector / data lines exiting the bottom of the video toward form */}
      <svg
        className="absolute -bottom-12 left-0 w-full"
        height="80"
        viewBox="0 0 1000 80"
        preserveAspectRatio="none"
      >
        <line x1="120" y1="0" x2="120" y2="80" stroke="#050505" strokeWidth="1" />
        <line x1="380" y1="0" x2="380" y2="60" stroke="#050505" strokeWidth="1" />
        <line x1="380" y1="60" x2="640" y2="60" stroke="#050505" strokeWidth="1" />
        <line x1="640" y1="60" x2="640" y2="80" stroke="#ff1500" strokeWidth="1" />
        <line x1="860" y1="0" x2="860" y2="40" stroke="#050505" strokeWidth="1" />
        <line x1="860" y1="40" x2="500" y2="40" stroke="#050505" strokeWidth="1" />
        <line x1="500" y1="40" x2="500" y2="80" stroke="#050505" strokeWidth="1" />
        <circle cx="120" cy="80" r="3" fill="#ff1500" />
        <circle cx="640" cy="80" r="3" fill="#ff1500" />
        <circle cx="500" cy="80" r="3" fill="#ff1500" />
      </svg>
    </div>
  );
}
