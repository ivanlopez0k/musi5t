"use client";

export function VinylStack() {
  return (
    <div className="relative w-full min-h-[64vw] sm:min-h-[22vw] flex items-center justify-center sm:justify-start py-[3vw] sm:py-[1.5vw] group select-none">
      {/* Vinyl Disc Peeking from the Front Sleeve */}
      <div
        className="absolute z-10 w-[46vw] sm:w-[17vw] aspect-square rounded-full bg-[#0a0a0a] border border-white/10 shadow-2xl flex items-center justify-center left-[10%] sm:left-[6%] top-[12%] sm:top-[10%] translate-x-[22%] sm:translate-x-[28%] group-hover:translate-x-[36%] sm:group-hover:translate-x-[44%] transition-transform duration-700 ease-out pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #0a0a0a 0%, #161616 35%, #0a0a0a 45%, #181818 60%, #0a0a0a 75%, #1c1c1c 90%, #080808 100%)",
        }}
      >
        {/* Grooves Rings */}
        <div className="w-[82%] h-[82%] rounded-full border border-white/5 flex items-center justify-center">
          <div className="w-[68%] h-[68%] rounded-full border border-white/5 flex items-center justify-center">
            {/* Center Paper Label */}
            <div className="w-[34%] h-[34%] rounded-full bg-yellow flex items-center justify-center shadow-inner relative">
              <div className="w-[22%] h-[22%] rounded-full bg-secondary border border-black" />
              <span className="absolute bottom-[18%] text-[1.4vw] sm:text-[0.45vw] font-bold text-secondary uppercase tracking-wider">
                musi5t
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record 1 (Back left) — Radiohead: In Rainbows */}
      <div className="absolute z-0 left-[2%] sm:left-[1%] top-[8%] sm:top-[6%] w-[46vw] sm:w-[16.5vw] aspect-square rounded-[1.5vw] sm:rounded-[0.35vw] overflow-hidden shadow-2xl border border-white/10 bg-secondary -rotate-[10deg] scale-95 group-hover:-rotate-[15deg] group-hover:-translate-x-2 transition-transform duration-500 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/musi5t/feature_top5_1.webp"
          alt="Radiohead - In Rainbows"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10 pointer-events-none" />
      </div>

      {/* Record 2 (Back right) — Daft Punk: Random Access Memories */}
      <div className="absolute z-1 left-[22%] sm:left-[12%] top-[6%] sm:top-[4%] w-[47vw] sm:w-[17vw] aspect-square rounded-[1.5vw] sm:rounded-[0.35vw] overflow-hidden shadow-2xl border border-white/10 bg-secondary rotate-[8deg] scale-95 group-hover:rotate-[13deg] group-hover:translate-x-2 transition-transform duration-500 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/musi5t/hero_right.webp"
          alt="Daft Punk - Random Access Memories"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10 pointer-events-none" />
      </div>

      {/* Record 3 (Middle) — Kendrick Lamar: GKMC */}
      <div className="absolute z-2 left-[10%] sm:left-[5%] top-[12%] sm:top-[10%] w-[48vw] sm:w-[17.5vw] aspect-square rounded-[1.5vw] sm:rounded-[0.35vw] overflow-hidden shadow-2xl border border-white/15 bg-secondary -rotate-[3deg] group-hover:-rotate-[6deg] transition-transform duration-500 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/musi5t/hero_left.webp"
          alt="Kendrick Lamar - Good Kid, M.A.A.D City"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
      </div>

      {/* Record 4 (Front & Center) — Tame Impala: Currents */}
      <div className="relative z-20 left-[-4%] sm:left-[0%] w-[50vw] sm:w-[18vw] aspect-square rounded-[1.5vw] sm:rounded-[0.4vw] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/20 bg-secondary rotate-[2deg] group-hover:rotate-0 group-hover:scale-[1.03] transition-all duration-500 ease-out">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/musi5t/hero_center.webp"
          alt="Tame Impala - Currents"
          className="w-full h-full object-cover"
        />
        {/* Realistic Sleeve Spine Shadow */}
        <div className="absolute top-0 left-0 w-[4%] h-full bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15 pointer-events-none" />

        {/* Edition Pill */}
        <div className="absolute top-[2vw] left-[2vw] sm:top-[0.7vw] sm:left-[0.7vw] bg-yellow text-secondary px-[1.8vw] py-[0.5vw] sm:px-[0.55vw] sm:py-[0.18vw] rounded-[0.2vw] detailText font-bold shadow-md tracking-tight flex items-center gap-[1vw] sm:gap-[0.3vw]">
          <span className="w-[1.2vw] h-[1.2vw] sm:w-[0.4vw] sm:h-[0.4vw] rounded-full bg-secondary" />
          <span>currents · 2015</span>
        </div>
      </div>
    </div>
  );
}
