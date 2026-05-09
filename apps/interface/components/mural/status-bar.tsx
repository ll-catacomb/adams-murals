"use client";

import { useEffect, useState } from "react";
import { ADAMS_COORDS, jitterCoord, nowStamp, randHex } from "./coords";

const TICKER = [
  "ADAMS_HOUSE / TUNNEL_LVL_-1 / WALL_REWILDING_PROTOCOL v.2026.5",
  "MURAL_SUBSTRATE: PLASTER + LATEX + UNKNOWN",
  "DURATION_TARGET: ~10² yrs",
  "INHERITED_FROM: '76, '83, '91, '04, '14, '23 ...",
  "BEQUEATHED_TO: 2126",
  "AUTHORIZED_PIGMENTS: ALL",
  "AUTHORIZED_GESTURES: ALL",
  "RECEPTION_QUORUM: ≥ 1 future passerby",
];

export function StatusBar() {
  const [stamp, setStamp] = useState("");
  const [coords, setCoords] = useState({
    lat: ADAMS_COORDS.lat.toFixed(5),
    lon: ADAMS_COORDS.lon.toFixed(5),
  });
  const [sid, setSid] = useState("00000000");

  useEffect(() => {
    setSid(randHex(8));
    setStamp(nowStamp());
    const i = setInterval(() => {
      setStamp(nowStamp());
      setCoords({
        lat: jitterCoord(ADAMS_COORDS.lat, 0.0006),
        lon: jitterCoord(ADAMS_COORDS.lon, 0.0006),
      });
      setSid(randHex(8));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b border-ink bg-bg">
      <div className="flex items-center justify-between gap-4 px-4 py-1 text-[12px] font-bit tabular">
        <div className="flex items-center gap-3">
          <span className="pulse-dot" />
          <span className="tracking-widest">SYS // ADAMS_HOUSE_2026</span>
          <span className="text-ink/60">::</span>
          <span className="text-ink/80">SESS_0x{sid}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span>{stamp}</span>
          <span className="text-ink/60">::</span>
          <span>
            N {coords.lat}° / W {Math.abs(parseFloat(coords.lon)).toFixed(5)}°
          </span>
        </div>
        <div className="text-red tracking-widest">REWILDING_IN_PROGRESS</div>
      </div>
      <div className="overflow-hidden border-t border-ink/40 bg-ink/5">
        <div className="marquee-track whitespace-nowrap py-[2px] text-[11px] font-bit text-ink/80">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="mx-6">
              ▸ {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
