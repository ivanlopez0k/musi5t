import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db, ensurePhase3Tables } from "@/db";
import { albums, userTopAlbums, users, albumFollows, albumRatings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";
import { AlbumFollowButton } from "@/components/album/AlbumFollowButton";
import { AlbumRatingWidget } from "@/components/album/AlbumRatingWidget";
import { getAlbumVisiblePosts } from "@/lib/feed/visibility";
import { InteractivePostList } from "@/components/feed/FeedView";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [album] = await db
    .select({ title: albums.title, artistName: albums.artistName })
    .from(albums)
    .where(eq(albums.id, id))
    .limit(1);

  if (!album) return { title: "Album not found — musi5t" };

  return {
    title: `${album.title} by ${album.artistName} — musi5t`,
    description: `Discussions, listener Top 5 rankings, and pressings for ${album.title}.`,
  };
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { id } = await params;

  await ensurePhase3Tables();

  const [album] = await db
    .select()
    .from(albums)
    .where(eq(albums.id, id))
    .limit(1);

  if (!album) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  // Check if following album
  let isFollowingAlbum = false;
  let userRatingScore: number | null = null;
  if (currentUser) {
    const [followRec] = await db
      .select({ userId: albumFollows.userId })
      .from(albumFollows)
      .where(and(eq(albumFollows.userId, currentUser.id), eq(albumFollows.albumId, album.id)))
      .limit(1);
    isFollowingAlbum = !!followRec;

    const [myRating] = await db
      .select({ score: albumRatings.score })
      .from(albumRatings)
      .where(and(eq(albumRatings.userId, currentUser.id), eq(albumRatings.albumId, album.id)))
      .limit(1);
    if (myRating) {
      userRatingScore = myRating.score;
    }
  }

  // Fetch community rating stats
  const [ratingStats] = await db
    .select({
      averageScore: sql<string | null>`ROUND(AVG(${albumRatings.score})::numeric, 1)::text`,
      ratingsCount: sql<string>`COUNT(*)::text`,
    })
    .from(albumRatings)
    .where(eq(albumRatings.albumId, album.id));

  const averageScore = ratingStats?.averageScore ? parseFloat(ratingStats.averageScore) : null;
  const ratingsCount = ratingStats?.ratingsCount ? parseInt(ratingStats.ratingsCount, 10) : 0;

  // Fetch users with this album in their Top 5
  const topListeners = await db
    .select({
      position: userTopAlbums.position,
      coverUrl: userTopAlbums.coverUrl,
      userId: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      themeKey: users.themeKey,
    })
    .from(userTopAlbums)
    .innerJoin(users, eq(userTopAlbums.userId, users.id))
    .where(eq(userTopAlbums.albumId, album.id))
    .orderBy(userTopAlbums.position)
    .limit(12);

  // Fetch posts tagged with this album
  const albumPosts = await getAlbumVisiblePosts({
    albumId: album.id,
    viewerUserId: currentUser?.id || null,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-[#11110F] text-[#E6E5DF] font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Navbar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-30 bg-[#11110F]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-medium tracking-tight text-sm hover:opacity-80 transition-opacity"
          >
            <span className="w-3 h-3 rounded-[2px] bg-[#FFE600]" />
            <span>musi5t</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/feed"
              className="text-xs font-mono opacity-70 hover:opacity-100 transition-opacity"
            >
              Feed
            </Link>
            {currentUser ? (
              <>
                <Link
                  href="/settings"
                  className="text-xs font-mono opacity-70 hover:opacity-100 transition-opacity"
                >
                  Settings
                </Link>
                <Link
                  href={`/@${currentUser.username}`}
                  className="flex items-center gap-2 text-xs font-mono opacity-80 hover:opacity-100 transition-opacity border border-white/15 rounded-full px-3 py-1"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FFE600]" />
                  <span>@{currentUser.username}</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs font-mono uppercase bg-[#FFE600] text-black px-4 py-1.5 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Album Container */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Album Hero Section */}
        <section className="flex flex-col md:flex-row items-start md:items-end gap-8 pb-10 border-b border-white/10">
          <div className="relative aspect-square w-48 sm:w-64 rounded-2xl overflow-hidden shadow-2xl border border-white/15 flex-shrink-0 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={album.defaultCoverUrl || "/images/musi5t/vinyl_player.webp"}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE600] uppercase tracking-wider">
              <span>[ Record Detail ]</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
              {album.title}
            </h1>
            <p className="text-lg text-white/70 font-light">
              {album.artistName} {album.releaseYear ? `• ${album.releaseYear}` : ""}
            </p>

            <div className="pt-4 flex items-center gap-3">
              <AlbumFollowButton
                albumId={album.id}
                initialFollowing={isFollowingAlbum}
                isLoggedIn={Boolean(currentUser)}
              />
            </div>
          </div>
        </section>

        {/* Rating Section (Phase 3) */}
        <section className="py-8 border-b border-white/10">
          <AlbumRatingWidget
            albumId={album.id}
            initialUserScore={userRatingScore}
            initialAverageScore={averageScore}
            initialRatingsCount={ratingsCount}
            isLoggedIn={Boolean(currentUser)}
          />
        </section>

        {/* Listeners With This in Top 5 */}
        <section className="py-12 border-b border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
                Curated in Top 5
              </h2>
            </div>
            <span className="text-xs font-mono opacity-50 uppercase tracking-widest">
              {topListeners.length} {topListeners.length === 1 ? "listener" : "listeners"}
            </span>
          </div>

          {topListeners.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-sm opacity-50">
              No listeners have added this album to their Top 5 yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topListeners.map((listener) => (
                <Link
                  key={`${listener.userId}-${listener.position}`}
                  href={`/@${listener.username}`}
                  className="flex flex-col items-center p-4 rounded-xl border border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] transition-all group text-center"
                >
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#FFE600] flex items-center justify-center text-black font-bold text-sm mb-2 shadow group-hover:scale-105 transition-transform">
                    {listener.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listener.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      listener.displayName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="font-medium text-xs text-white truncate w-full">
                    {listener.displayName}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">
                    @{listener.username}
                  </span>
                  <span className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20">
                    Rank #{listener.position}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Discussions & Posts About This Record */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
                Discussions
              </h2>
            </div>
            <span className="text-xs font-mono opacity-50 uppercase tracking-widest">
              [ #album thread ]
            </span>
          </div>

          {albumPosts.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center">
              <p className="text-sm opacity-50 mb-3">
                No discussions about this album yet.
              </p>
              <Link
                href="/feed"
                className="inline-block px-4 py-2 rounded-lg text-xs font-mono uppercase bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Go to Feed to Post
              </Link>
            </div>
          ) : (
            <div className="max-w-2xl">
              <InteractivePostList
                posts={albumPosts}
                currentUser={currentUser}
                variant="dark"
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

