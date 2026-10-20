import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { db } from "@/db";
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

interface PageProps {
  searchParams: Promise<{ timeframe?: string }>;
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const { timeframe = "all" } = (await searchParams) || {};
  const currentUser = await getCurrentUser();
  const currentYear = new Date().getFullYear();

  const validTimeframe =
    timeframe === "year" || timeframe === "month" ? timeframe : "all";

  const rows = await db.execute<RawRankedAlbumRow>(sql`
    SELECT
      a.id,
      a.title,
      a.artist_name,
      a.release_year,
      a.default_cover_url,
      ROUND(ar_stat.avg_score::numeric, 1)::text AS average_score,
      COALESCE(ar_stat.ratings_count, 0)::text AS ratings_count,
      COALESCE(uta_stat.curators_count, 0)::text AS curators_count
    FROM albums a
    LEFT JOIN (
      SELECT 
        album_id, 
        AVG(score) AS avg_score, 
        COUNT(*) AS ratings_count
      FROM album_ratings
      ${
        validTimeframe === "month"
          ? sql`WHERE created_at >= NOW() - INTERVAL '30 days'`
          : sql``
      }
      GROUP BY album_id
    ) ar_stat ON ar_stat.album_id = a.id
    LEFT JOIN (
      SELECT 
        album_id, 
        COUNT(*) AS curators_count
      FROM user_top_albums
      ${
        validTimeframe === "month"
          ? sql`WHERE created_at >= NOW() - INTERVAL '30 days'`
          : sql``
      }
      GROUP BY album_id
    ) uta_stat ON uta_stat.album_id = a.id
    WHERE (COALESCE(ar_stat.ratings_count, 0) > 0 OR COALESCE(uta_stat.curators_count, 0) > 0)
      ${validTimeframe === "year" ? sql`AND a.release_year = ${currentYear}` : sql``}
    ORDER BY
      COALESCE(ar_stat.avg_score, 0) DESC,
      COALESCE(ar_stat.ratings_count, 0) DESC,
      COALESCE(uta_stat.curators_count, 0) DESC
    LIMIT 100
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
    <RankingsView
      rankedAlbums={rankedAlbums}
      currentUser={currentUser}
      timeframe={validTimeframe}
      currentYear={currentYear}
    />
  );
}
