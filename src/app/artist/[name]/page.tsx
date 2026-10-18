import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getArtistData } from "@/lib/catalog/artist";
import { getArtistVisiblePosts } from "@/lib/feed/visibility";
import { ArtistDetailView } from "@/components/artist/ArtistDetailView";

export const instant = false;

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name).trim();

  return {
    title: `${decodedName} — musi5t`,
    description: `Discography, community ratings, and listener discussions for ${decodedName} on musi5t.`,
  };
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name).trim();

  const currentUser = await getCurrentUser();
  const artistData = await getArtistData(decodedName, currentUser?.id || null);

  const artistPosts = await getArtistVisiblePosts({
    artistName: decodedName,
    viewerUserId: currentUser?.id || null,
    limit: 20,
  });

  return (
    <ArtistDetailView
      artist={artistData}
      currentUser={currentUser}
      artistPosts={artistPosts}
    />
  );
}
