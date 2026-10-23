import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — musi5t",
  description: "Learn how musi5t collects, protects, and respects your music taste and account information.",
};

export default function PrivacyPage() {
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
                <span className="smallText opacity-60">privacy policy</span>
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

          {/* Main Legal Content */}
          <main className="layout-fixed layout-grid py-[8vw] sm:py-[5vw]">
            <article className="col-span-full sm:col-span-8 sm:col-start-3 flex flex-col gap-[4vw] sm:gap-[2.5vw]">
              <div>
                <span className="detailText uppercase tracking-widest text-secondary/50 font-bold block mb-2">
                  Legal & Transparency
                </span>
                <h1 className="text-[7vw] sm:text-[3.2vw] font-bold leading-tight tracking-tight text-secondary">
                  Privacy Policy
                </h1>
                <p className="extraSmallText text-secondary/50 mt-2">
                  Last updated: October 2026 • Effective immediately for all members
                </p>
              </div>

              <div className="h-px bg-secondary/15 w-full my-2" />

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">1. Our Core Principle: Taste, Not Telemetry</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  musi5t was founded on a simple promise: we celebrate vinyl collections, album sequencing, and genuine listener discourse. We do not sell your personal data, we do not package your listening habits for advertisers, and we never embed invasive third-party ad trackers.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">2. Information We Collect</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  To operate the platform and allow you to curate your profile, we collect:
                </p>
                <ul className="list-disc pl-5 extraSmallText text-secondary/80 flex flex-col gap-2">
                  <li>
                    <strong>Account Information:</strong> Your username, display name, email address, and an encrypted password hash (salted via bcryptjs).
                  </li>
                  <li>
                    <strong>Curated Content:</strong> Your Top 5 albums, Top 5 songs, custom vinyl rotation lists, album ratings, reviews, and discussion posts.
                  </li>
                  <li>
                    <strong>Profile Customization:</strong> Your selected theme accent palette (e.g. Lime, Coral, Cobalt, Obsidian), bio, and uploaded avatar image stored in Supabase Cloud Storage.
                  </li>
                </ul>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">3. Catalog Metadata & Public APIs</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  musi5t interfaces with open music encyclopedias, primarily the <strong>MusicBrainz Database</strong> and the <strong>Cover Art Archive</strong>, as well as the iTunes Search API, to enrich album records, tracklists, release years, and cover artwork. When you query records, search terms are matched against these public music repositories.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">4. Cookies & Session Storage</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  We use secure, HTTP-only session cookies signed with JWT (JSON Web Tokens) solely to maintain your authentication state. We do not use third-party advertising or cross-site behavioral tracking cookies.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">5. Data Retention & Deletion</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  You maintain full sovereignty over your data. You may edit or remove your Top 5 rotation, posts, lists, and ratings at any time. If you choose to delete your account via the <strong>Settings</strong> dashboard, all associated personal records, ratings, lists, and uploaded media are permanently purged from our database via cascade deletion.
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="smallText font-bold text-secondary">6. Contact Us</h2>
                <p className="extraSmallText text-secondary/80 leading-relaxed">
                  If you have inquiries regarding your privacy or data protection rights, contact the team at{" "}
                  <a href="mailto:privacy@musi5t.com" className="underline underline-offset-4 font-medium hover:text-yellow">
                    privacy@musi5t.com
                  </a>.
                </p>
              </section>

              <div className="h-px bg-secondary/15 w-full my-4" />

              <div className="flex justify-between items-center text-secondary/60 extraSmallText">
                <Link href="/terms" className="hover:text-secondary underline underline-offset-4">
                  Terms of Use →
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
