import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { users, albums, songs, userTopAlbums, userTopSongs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, sql, asc } from "drizzle-orm";
import { ProfileView } from "@/components/profile/ProfileView";

export const instant = false;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "").toLowerCase();

  const [user] = await db
    .select({
      displayName: users.displayName,
      username: users.username,
      bio: users.bio,
    })
    .from(users)
    .where(eq(sql`LOWER(${users.username})`, username))
    .limit(1);

  if (!user) {
    return {
      title: "User not found — musi5t",
    };
  }

  return {
    title: `${user.displayName} (@${user.username}) — musi5t`,
    description: user.bio || `Explore ${user.displayName}'s Top 5 essential albums and songs on musi5t.`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "").toLowerCase();

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      themeKey: users.themeKey,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(sql`LOWER(${users.username})`, username))
    .limit(1);

  if (!user) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === user.id;

  // Fetch top 5 albums
  const userAlbums = await db
    .select({
      id: userTopAlbums.id,
      position: userTopAlbums.position,
      coverUrl: userTopAlbums.coverUrl,
      title: albums.title,
      artistName: albums.artistName,
      releaseYear: albums.releaseYear,
    })
    .from(userTopAlbums)
    .innerJoin(albums, eq(userTopAlbums.albumId, albums.id))
    .where(eq(userTopAlbums.userId, user.id))
    .orderBy(asc(userTopAlbums.position));

  // Fetch top 5 songs
  const userSongs = await db
    .select({
      id: userTopSongs.id,
      position: userTopSongs.position,
      title: songs.title,
      artistName: songs.artistName,
      coverUrl: songs.coverUrl,
    })
    .from(userTopSongs)
    .innerJoin(songs, eq(userTopSongs.songId, songs.id))
    .where(eq(userTopSongs.userId, user.id))
    .orderBy(asc(userTopSongs.position));

  return (
    <ProfileView
      user={user}
      isOwner={isOwner}
      topAlbums={userAlbums}
      topSongs={userSongs}
    />
  );
}
