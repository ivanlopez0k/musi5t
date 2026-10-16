import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export const instant = false;

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/feed");
  }

  return <LandingPageClient />;
}
