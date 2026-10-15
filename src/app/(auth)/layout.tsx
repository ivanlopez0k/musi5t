import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#11110F] text-[#E6E5DF] flex flex-col justify-between selection:bg-[#FFE600] selection:text-black">
      {/* Top Bar with musi5t logo */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center z-10">
        <Link
          href="/"
          className="text-lg font-medium tracking-tight text-[#E6E5DF] hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 bg-[#FFE600] rounded-sm inline-block" />
          musi5t
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#E6E5DF]/40 font-mono">
          album-first social
        </span>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        {children}
      </main>

      {/* Subtle bottom footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-[#E6E5DF]/30">
        musi5t &copy; 2026 — Curate your 5. Connect through records.
      </footer>

      {/* Ambient background blur circles */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FFE600]/5 rounded-full blur-[140px]"
        aria-hidden="true"
      />
    </div>
  );
}
