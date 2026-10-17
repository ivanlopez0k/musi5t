import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { db, ensurePhase3Tables } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  RankingsView,
  type RankedAlbumItem,
} from "@/components/rankings/RankingsView";

export const instant = false;

export const metadata: Metadata = {
  title: "Community Rankings — musi5t",
  description: "The highest rated and most curated records across musi5t.",
};

interface RawRankedAlbumRow {
  id: string;
  title: string;
  artist_name: string;
  release_year: number | null;
  default_cover_url: string | null;
  average_score: string | null;
  ratings_count: string;
  curators_count: string;
  [key: string]: unknown;
}

export default async function RankingsPage() {
  await ensurePhase3Tables();
  const currentUser = await getCurrentUser();

  const rows = await db.execute<RawRankedAlbumRow>(sql`
    SELECT
      a.id,
      a.title,
      a.artist_name,
      a.release_year,
      a.default_cover_url,
      ROUND(AVG(ar.score)::numeric, 1)::text AS average_score,
      COUNT(DISTINCT ar.user_id)::text AS ratings_count,
      COUNT(DISTINCT uta.id)::text AS curators_count
    FROM albums a
    LEFT JOIN album_ratings ar ON ar.album_id = a.id
    LEFT JOIN user_top_albums uta ON uta.album_id = a.id
    GROUP BY a.id
    HAVING COUNT(DISTINCT ar.user_id) > 0 OR COUNT(DISTINCT uta.id) > 0
    ORDER BY
      COALESCE(AVG(ar.score), 0) DESC,
      COUNT(DISTINCT ar.user_id) DESC,
      COUNT(DISTINCT uta.id) DESC
    LIMIT 50
  `);

  const rankedAlbums: RankedAlbumItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    artistName: r.artist_name,
    releaseYear: r.release_year ? Number(r.release_year) : null,
    defaultCoverUrl: r.default_cover_url,
    averageScore: r.average_score,
    ratingsCount: parseInt(r.ratings_count, 10) || 0,
    curatorsCount: parseInt(r.curators_count, 10) || 0,
  }));

  return (
    <RankingsView rankedAlbums={rankedAlbums} currentUser={currentUser} />
  );
}
