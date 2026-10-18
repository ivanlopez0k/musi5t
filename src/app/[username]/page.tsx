import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { users, albums, songs, userTopAlbums, userTopSongs, follows, mutes, blocks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq, sql, asc, and } from "drizzle-orm";
import { ProfileView } from "@/components/profile/ProfileView";
import { getUserVisiblePosts } from "@/lib/feed/visibility";

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
    openGraph: {
      title: `${user.displayName}'s Top 5 Albums — musi5t`,
      description: user.bio || `Explore ${user.displayName}'s Top 5 essential albums on musi5t.`,
      images: [
        {
          url: `/api/v1/users/${username}/og`,
          width: 1200,
          height: 630,
          alt: `${user.displayName}'s Top 5 Albums on musi5t`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.displayName}'s Top 5 Albums — musi5t`,
      description: user.bio || `Explore ${user.displayName}'s Top 5 essential albums on musi5t.`,
      images: [`/api/v1/users/${username}/og`],
    },
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

  // Check if profile owner blocked currentUser
  if (currentUser && !isOwner) {
    const [blockedByOwner] = await db
      .select({ blockerId: blocks.blockerId })
      .from(blocks)
      .where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, currentUser.id)))
      .limit(1);
    if (blockedByOwner) {
      notFound();
    }
  }

  // Fetch top 5 albums
  const userAlbums = await db
    .select({
      id: userTopAlbums.id,
      albumId: userTopAlbums.albumId,
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

  let isFollowing = false;
  let isMuted = false;
  let isBlocked = false;
  if (currentUser && !isOwner) {
    const [followRecord] = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(and(eq(follows.followerId, currentUser.id), eq(follows.followeeId, user.id)))
      .limit(1);
    isFollowing = !!followRecord;

    const [muteRecord] = await db
      .select({ muterId: mutes.muterId })
      .from(mutes)
      .where(and(eq(mutes.muterId, currentUser.id), eq(mutes.mutedId, user.id)))
      .limit(1);
    isMuted = !!muteRecord;

    const [blockRecord] = await db
      .select({ blockerId: blocks.blockerId })
      .from(blocks)
      .where(and(eq(blocks.blockerId, currentUser.id), eq(blocks.blockedId, user.id)))
      .limit(1);
    isBlocked = !!blockRecord;
  }

  const userPosts = await getUserVisiblePosts({
    profileUserId: user.id,
    viewerUserId: currentUser?.id || null,
    limit: 20,
  });

  return (
    <ProfileView
      user={user}
      isOwner={isOwner}
      isFollowing={isFollowing}
      isMuted={isMuted}
      isBlocked={isBlocked}
      isLoggedIn={Boolean(currentUser)}
      currentUser={currentUser}
      topAlbums={userAlbums}
      topSongs={userSongs}
      userPosts={userPosts}
    />
  );
}

