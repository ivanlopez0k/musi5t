import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { getDetailedListById } from "@/lib/lists/service";
import { ListView } from "@/components/lists/ListView";

export const instant = false;

interface ListPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListPageProps): Promise<Metadata> {
  const { id } = await params;
  const { list } = await getDetailedListById(id, null);

  if (!list) {
    return {
      title: "List Not Found | musi5t",
    };
  }

  return {
    title: `${list.title} by @${list.author.username} | musi5t`,
    description: list.description || `Curated album list by @${list.author.username} on musi5t.`,
  };
}

export default async function ListDetailPage({ params }: ListPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const { list, isPrivateForbidden } = await getDetailedListById(
    id,
    currentUser?.id || null
  );

  if (isPrivateForbidden) {
    return (
      <div className="site-frame text-secondary min-h-screen flex items-center justify-center p-6 bg-primary">
        <div className="max-w-md text-center flex flex-col items-center gap-4">
          <h1 className="mediumText font-bold text-secondary">Private List</h1>
          <p className="extraSmallText text-secondary/60">
            This curated list is marked as private by its author.
          </p>
          <Link
            href="/lists"
            className="extraSmallText underline hover:text-secondary text-secondary/80 mt-2"
          >
            Back to Community Lists
          </Link>
        </div>
      </div>
    );
  }

  if (!list) {
    notFound();
  }

  const currentUserSummary = currentUser
    ? {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        themeKey: currentUser.themeKey,
      }
    : null;

  return <ListView initialList={list} currentUser={currentUserSummary} />;
}
