import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getListsFeed } from "@/lib/lists/service";
import { ListsFeedView } from "@/components/lists/ListsFeedView";

export const instant = false;

export const metadata: Metadata = {
  title: "Curated Lists | musi5t",
  description: "Thematic album selections, historical deep-dives, and seasonal rotations curated by the musi5t community.",
};

export default async function ListsPage() {
  const currentUser = await getCurrentUser();
  const lists = await getListsFeed({
    limit: 24,
    includePrivate: false,
  });

  const currentUserSummary = currentUser
    ? {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        themeKey: currentUser.themeKey,
      }
    : null;

  return <ListsFeedView initialLists={lists} currentUser={currentUserSummary} />;
}
