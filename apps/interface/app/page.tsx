import { StatusBar } from "@/components/mural/status-bar";
import { VideoHero } from "@/components/mural/video-hero";
import { MuralForm } from "@/components/mural/form";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-ink relative">
      {/* soft volumetric fog blobs (decorative, fixed) */}
      <div
        className="fog"
        style={{ top: "10%", left: "-8%", width: 320, height: 320, background: "#ff1500" }}
      />
      <div
        className="fog"
        style={{ bottom: "20%", right: "-10%", width: 360, height: 360, background: "#050505" }}
      />
      <div
        className="fog"
        style={{ bottom: "-6%", left: "-8%", width: 420, height: 420, background: "#ff1500" }}
      />

      <StatusBar />

      <main className="relative">
        {/* HERO */}
        <div className="px-3 sm:px-6 pt-6">
          <div className="max-w-6xl mx-auto">
            <VideoHero />
          </div>
        </div>

        {/* SEPARATOR / system note */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-20">
          <div className="flex items-center gap-3">
            <span className="font-bit text-[12px] tracking-widest text-ink/60">§2</span>
            <div className="flex-1 h-px bg-ink/30" />
            <span className="font-bit text-[12px] tracking-widest text-red">
              SUBMISSION_FORM
            </span>
            <div className="flex-1 h-px bg-ink/30" />
            <span className="font-bit text-[12px] tracking-widest text-ink/60">
              IO::OPEN
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.55]">
            For decades, the Adams House tunnels have been a kind of underworld
            scrapbook. Some of the most beloved marks down there are the size of a
            thumbprint. Some sprawl. Some are inside jokes only three roommates will
            ever understand, which is, frankly, the most magical kind. Tell me yours.
          </p>
          <p className="mt-3 font-bit text-[12px] text-ink/60 tabular">
            ▸ FORM_FIELDS=8  ▸ EST_TIME=4min  ▸ WINDOWS=5/16, 5/23, 5/25
          </p>
        </div>

        {/* FORM */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-32">
          <MuralForm />
        </div>

        {/* footer */}
        <footer className="border-t border-ink mt-12 px-4 py-4 max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-3 font-bit text-[11px] tabular text-ink/70">
            <span>
              ADAMS_HOUSE / 26_PLYMPTON_ST / CAMBRIDGE_MA / N42.37207° W71.11762°
            </span>
            <span>
              MAINTAINED_BY :: M.WOODS &nbsp;::&nbsp; CONJURED_PAINT :: M.BURKE
            </span>
            <span className="text-red">REWILDING_PROTOCOL_v.2026.5</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
