import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Home() {
  const sampleTopAlbums = [
    { position: 1, title: "In Rainbows", artist: "Radiohead", year: 2007, color: "#E05A47" },
    { position: 2, title: "Blonde", artist: "Frank Ocean", year: 2016, color: "#8E9A76" },
    { position: 3, title: "Abbey Road", artist: "The Beatles", year: 1969, color: "#3B4A6B" },
    { position: 4, title: "Currents", artist: "Tame Impala", year: 2015, color: "#5E3B76" },
    { position: 5, title: "Discovery", artist: "Daft Punk", year: 2001, color: "#D48B38" },
  ];

  return (
    <div className="flex flex-col min-h-screen px-6 py-6 md:px-12 md:py-8 max-w-[1600px] mx-auto w-full">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pb-12 border-b border-black/5">
        <div className="flex items-center gap-8">
          <span className="text-xl md:text-2xl font-bold tracking-tight lowercase">
            musi5t
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm opacity-60">
            <a href="#feed" className="hover:opacity-100 transition-opacity">feed</a>
            <a href="#explore" className="hover:opacity-100 transition-opacity">explore</a>
            <a href="#top5" className="hover:opacity-100 transition-opacity">top 5</a>
            <a href="#about" className="hover:opacity-100 transition-opacity">about</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button className="text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-black text-white hover:opacity-80 transition-opacity font-medium">
            join
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-between py-12 md:py-20">
        <div className="max-w-4xl space-y-6">
          <div className="inline-block text-[11px] uppercase tracking-widest px-3 py-1 rounded-full border border-black/10 opacity-60">
            sprint 0 — foundational architecture
          </div>
          <h1 className="text-4xl md:text-7xl font-medium tracking-tight lowercase leading-[1.05]">
            the social platform for album lovers.
          </h1>
          <p className="text-base md:text-xl opacity-70 max-w-xl font-normal leading-relaxed">
            Curate your top 5 albums and songs. Visibility and feeds revolve around the records you love, not algorithms.
          </p>
        </div>

        {/* Top 5 Showcase Grid */}
        <section id="top5" className="mt-16 pt-8 border-t border-black/5">
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-xs uppercase tracking-widest opacity-40">
              user top 5 — preview
            </span>
            <span className="text-xs opacity-50 lowercase">
              musicbrainz + cover art archive integration
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {sampleTopAlbums.map((album) => (
              <div
                key={album.position}
                className="group relative flex flex-col rounded-xl overflow-hidden border border-black/5 bg-white/40 p-3 transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: album.color }}
                >
                  <span className="text-4xl md:text-5xl font-black text-white/30 select-none">
                    0{album.position}
                  </span>
                  <div className="absolute top-2 right-2 text-[10px] font-mono uppercase bg-black/40 text-white px-1.5 py-0.5 rounded">
                    {album.year}
                  </div>
                </div>

                <div className="mt-3 flex flex-col">
                  <span className="text-sm font-semibold truncate lowercase group-hover:underline">
                    {album.title}
                  </span>
                  <span className="text-xs opacity-60 truncate lowercase">
                    {album.artist}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-8 pb-4 border-t border-black/5 flex flex-col md:flex-row items-center justify-between text-xs opacity-50 gap-4">
        <span>musi5t © 2026 — built on next.js, drizzle orm & postgresql</span>
        <span>aesthetic inspired by itsasidejob.com</span>
      </footer>
    </div>
  );
}
