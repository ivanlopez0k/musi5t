import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getReleasesData } from "@/lib/catalog/releases";
import { ReleasesView } from "@/components/releases/ReleasesView";

export const instant = false;

export const metadata: Metadata = {
  title: "Release Radar — musi5t",
  description:
    "New Music Friday drops, upcoming records, and announcements from your favorite artists.",
};

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ReleasesPage({ searchParams }: PageProps) {
  const { view } = (await searchParams) || {};
  const currentUser = await getCurrentUser();

  const validView =
    view === "upcoming" || view === "my-artists" || view === "recent"
      ? view
      : "this-week";

  const data = await getReleasesData({
    view: validView,
    viewerUserId: currentUser?.id || null,
  });

  return <ReleasesView data={data} currentUser={currentUser} />;
}
