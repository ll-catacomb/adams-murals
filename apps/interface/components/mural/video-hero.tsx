"use client";

import { useEffect, useRef } from "react";
import { CVOverlay } from "./cv-overlay";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.9;
    v.play().catch(() => {});
  }, []);

  return (
    <section className="relative w-full bracket-corners">
      {/* video frame, fixed aspect */}
      <div className="relative w-full aspect-[16/9] overflow-hidden border border-ink scanlines">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/murals.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
        {/* CV overlays (highlights, bboxes, coords, counters) */}
        <CVOverlay />
      </div>

      {/* TITLE BAND directly under video */}
      <div className="relative mt-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="font-bit text-[14px] text-ink/60 tracking-widest">
            §1 / TRANSMISSION
          </span>
          <span className="font-bit text-[14px] text-red tracking-widest">
            ◢ 2026 SENIOR CLASS
          </span>
        </div>
        <h1 className="mt-3 font-bit text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] uppercase tracking-tight">
          <span className="glitch" data-text="ADAMS HOUSE">
            ADAMS HOUSE
          </span>
        </h1>
        <h2 className="font-bit text-[clamp(1.8rem,5vw,3.5rem)] leading-[1] tracking-tight uppercase">
          <span className="text-red">::</span> SENIOR MURAL PAINTING /
          <span className="text-red">2026</span>
        </h2>
        <p className="mt-6 max-w-2xl text-[15px] leading-[1.55] text-ink/85">
          The tunnels of Adams House are yours to transform. A quote in gold. A moth on
          a pipe. A constellation tucked behind a doorway, visible only if you know to
          look. Step forward, share your idea, and let&apos;s bring these walls to life
          together.
        </p>
        <p className="mt-3 max-w-2xl text-[13px] leading-[1.5] text-ink/60 font-bit">
          ▸ NO ART SKILLS REQUIRED  ▸ JUST YOUR VISION  ▸ MARK PERSISTS ~10² YRS
        </p>
      </div>
    </section>
  );
}
