import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { blocks, mutes, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { SettingsView } from "@/components/settings/SettingsView";

export const instant = false;

export const metadata: Metadata = {
  title: "Settings — musi5t",
  description: "Manage your profile, color palette, muted/blocked accounts, and privacy.",
};

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const mutedUsers = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(mutes)
    .innerJoin(users, eq(mutes.mutedId, users.id))
    .where(eq(mutes.muterId, currentUser.id));

  const blockedUsers = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(blocks)
    .innerJoin(users, eq(blocks.blockedId, users.id))
    .where(eq(blocks.blockerId, currentUser.id));

  return (
    <SettingsView
      user={currentUser}
      initialMutedUsers={mutedUsers}
      initialBlockedUsers={blockedUsers}
    />
  );
}
