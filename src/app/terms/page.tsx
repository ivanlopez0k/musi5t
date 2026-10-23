import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — musi5t",
  description: "Terms and conditions for curating, discovering, and discussing records on musi5t.",
};

export default function TermsPage() {
  return (
    <div className="site-frame min-h-screen bg-primary text-secondary selection:bg-yellow selection:text-secondary">
      <div className="site-layout">
        <div className="app">
          {/* Header */}
          <header className="w-full border-b border-secondary/10 bg-primary/80 backdrop-blur-md sticky top-0 z-50">
            <div className="layout-fixed layout-grid py-[3vw] sm:py-[1.2vw] items-center">
              <div className="col-span-6 flex items-center gap-[2vw] sm:gap-[1vw]">
                <Link
                  href="/"
                  className="mediumText font-bold tracking-tight hover:opacity-70 transition-opacity"
                >
                  musi5t
                </Link>
                <span className="opacity-30 text-sm">/</span>
                <span className="smallText opacity-60">terms of use</span>
              </div>
              <div className="col-span-6 flex justify-end items-center gap-[2vw]">
                <Link
                  href="/"
                  className="extraSmallText opacity-60 hover:opacity-100 transition-opacity"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </header>

          {/* Main Terms Content */}
          <main className="layout-fixed layout-grid py-[8vw] sm:py-[5vw]">
            <article className="col-span-full sm:col-span-8 sm:col-start-3 flex flex-col gap-[4vw] sm:gap-[2.5vw]">
              <div>
                <span className="detailText uppercase tracking-widest text-secondary/50 font-bold block mb-2">
                  Agreement & Guidelines
                </span>
                <h1 className="text-[7vw] sm:text-[3.2vw] font-bold leading-tight tracking-tight text-secondary">
                  Terms of Service
                </h1>
                <p className="extraSmallText text-secondary/50 mt-2">
                  Last updated: October 2026 • Effective for all listeners and curators
                </p>
              </div>

              <div className="h-px bg-secondary/15 w-full my-2" />

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">1. Acceptance of Terms</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  By accessing, creating an account on, or interacting with musi5t (&quot;the Service&quot;), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any provision, please discontinue use of the platform.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">2. Community Standards & Code of Conduct</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  musi5t is an authentic community space designed for passionate music fans. While musical disagreement and heated debate over discographies are welcomed, the following behaviors are strictly prohibited:
                </p>
                <ul className="list-disc pl-5 extraSmallText text-secondary/80 flex flex-col gap-2">
                  <li>Harassment, threats, hate speech, or discriminatory attacks against any artist or community member.</li>
                  <li>Spamming, automated scraping, or commercial self-promotion unrelated to genuine musical discussion.</li>
                  <li>Impersonating artists, record labels, or other listeners.</li>
                  <li>Uploading malicious binaries or abusing public API endpoints.</li>
                </ul>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">3. Intellectual Property & Fair Use</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  Album titles, artist names, liner notes, and cover artwork displayed across the platform remain the intellectual property of their respective artists, rights holders, and record labels. musi5t utilizes album cover artwork and release metadata under Fair Use principles for purposes of identification, review, indexing, and non-commercial critical commentary.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">4. User Content & Ownership</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  You retain complete ownership of the reviews, comments, rotation lists, and original thoughts you write on musi5t. By posting content to public areas of the Service, you grant musi5t a worldwide, non-exclusive license to display, sequence, and distribute your content within the platform and associated social share cards (such as Top 5 posters).
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">5. Termination & Account Inactivity</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that repeatedly violate community guidelines or compromise the security of the platform. You may terminate your account at any time via your Account Settings.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">6. Disclaimer of Warranties</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. musi5t does not guarantee that third-party metadata feeds from MusicBrainz or Cover Art Archive will be uninterrupted or error-free.
                </p>
              </section>

              <div className="h-px bg-secondary/15 w-full my-4" />

              <div className="flex justify-between items-center text-secondary/60 extraSmallText">
                <Link href="/privacy" className="hover:text-secondary underline underline-offset-4">
                  ← Privacy Policy
                </Link>
                <Link href="/" className="hover:text-secondary underline underline-offset-4">
                  Return to musi5t
                </Link>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
