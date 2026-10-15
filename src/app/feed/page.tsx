import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeedPosts } from "@/lib/feed/visibility";
import { FeedView } from "@/components/feed/FeedView";

export const instant = false;

export const metadata: Metadata = {
  title: "Feed — musi5t",
  description: "Authentic discussions centered around records and essential albums.",
};

export default async function FeedPage() {
  const currentUser = await getCurrentUser();
  const initialType = currentUser ? "for-you" : "global";

  const initialPosts = await getFeedPosts({
    userId: currentUser?.id || null,
    type: initialType,
    limit: 20,
  });

  return (
    <FeedView
      currentUser={currentUser}
      initialPosts={initialPosts}
      initialType={initialType}
    />
  );
}
