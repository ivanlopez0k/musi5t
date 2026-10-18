import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, ensurePhase3Tables } from "@/db";
import { albums, userTopAlbums, users, albumFollows, albumRatings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";
import { getAlbumVisiblePosts } from "@/lib/feed/visibility";
import { getAlbumTracklist } from "@/lib/catalog/tracks";
import { AlbumDetailView } from "@/components/album/AlbumDetailView";

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

  // Check if following album & user rating
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

  // Fetch posts tagged with this album & tracklist
  const [albumPosts, tracklist] = await Promise.all([
    getAlbumVisiblePosts({
      albumId: album.id,
      viewerUserId: currentUser?.id || null,
      limit: 20,
    }),
    getAlbumTracklist(album.artistName, album.title),
  ]);

  return (
    <AlbumDetailView
      album={{
        id: album.id,
        title: album.title,
        artistName: album.artistName,
        releaseYear: album.releaseYear,
        defaultCoverUrl: album.defaultCoverUrl,
      }}
      currentUser={currentUser}
      isFollowingAlbum={isFollowingAlbum}
      userRatingScore={userRatingScore}
      averageScore={averageScore}
      ratingsCount={ratingsCount}
      topListeners={topListeners}
      albumPosts={albumPosts}
      tracklist={tracklist}
    />
  );
}
